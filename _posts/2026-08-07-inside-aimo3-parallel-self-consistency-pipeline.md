---
layout: post
title: "AI Just Posted a Perfect Score at the Real Math Olympiad. I Spent Months Building One of These Systems — Here's What It Actually Takes"
---

In July 2026, in Shanghai, something happened that mathematicians had been debating for two years: AI systems from Huawei and Xiaohongshu were each reported to have solved all six problems of the International Mathematical Olympiad — a perfect 42 out of 42. Several other labs reported matching results on their own. It followed a 2025 breakthrough where Google DeepMind's Gemini Deep Think, officially graded by IMO coordinators, and an OpenAI experimental model both reached the gold-medal threshold of 35/42.

Headlines called it AI "beating" the world's best teenage mathematicians. I want to tell you what's actually behind a headline like that — not as a journalist, but as someone who spent the past several months building a much smaller, much less glamorous version of exactly this kind of system.

My teammate Samuel Koh and I entered AIMO3 — the third AI Mathematical Olympiad Progress Prize, hosted on Kaggle. We scored 42 out of 50, placing 495th out of 4,138 teams — the top 12% globally. Here's the honest, unglamorous story of how we got there, what we tried that failed, and what the finished system actually looks like under the hood.

## What AIMO Actually Is (And Why It's Not the IMO)

First, an important distinction, because the acronyms get confusing fast: AIMO is not the IMO.

The AI Mathematical Olympiad is a $10 million prize fund, created in 2023, that exists specifically to close the gap between what the closed, proprietary models at OpenAI and Google can do and what the open community can build. Its grand prize — $5 million — goes to the first team that publicly shares a model capable of gold-medal-equivalent performance at the actual IMO. Along the way, Kaggle hosts periodic "Progress Prize" competitions to measure how far the open field has come.

AIMO1 was won by Project Numina in 2024. AIMO2 was won by NVIDIA's team, NemoSkills, who solved 34 of 50 problems. AIMO3 — the one we entered — raised the difficulty again: 110 entirely original problems, ranging from national-olympiad level up to full IMO standard, spanning algebra, combinatorics, geometry, and number theory. "Entirely original" matters enormously here — it means no amount of memorization from training data helps you. Every problem has to be reasoned through, not recalled.

Competitors were also given access to H100 GPUs, roughly double the compute of AIMO2, which meant we could run larger open-weight models than previous years — models like GPT-OSS-120B and Qwen3-Next became viable for the first time.

So when you read that an AI "scored a perfect IMO," understand what's actually being claimed. In 2026, most of those results — including the ones from Huawei and Xiaohongshu — were the companies' own self-reported submissions, run after the human competition window closed, evaluated against the same problems and time limit but not scored live by IMO coordinators. Only a small number of 2025 and 2026 results have been independently, officially graded. That's not a reason to dismiss the progress — it's real, and it's fast — but it's worth knowing the difference between "officially certified" and "self-administered" when you see the next big claim.

## Two Rules That Shaped Every Decision We Made

Before I describe what we built, you need to understand the two constraints that made this hard, because they killed almost every "obvious" idea we had.

**Rule one: five hours of GPU compute, total, per problem set.** Not per problem — per set. That immediately rules out anything computationally greedy.

**Rule two: binary scoring, no partial credit.** A problem is either fully correct or fully wrong. This sounds simple, but it has a brutal implication: a system that produces a plausible, confident-sounding, but wrong answer is worse than a "generic" wrong answer, because it's confidently wrong. Under this rule, knowing when your system is unsure is almost as valuable as getting the right answer.

I handled the mathematical side — interpreting problems, checking whether a given line of reasoning was actually valid, and sourcing harder test cases beyond the standard dataset to stress-test our system. Samuel handled the engineering — building and running the inference pipeline under that fixed compute budget. Neither role alone was enough. The problems weren't purely mathematical, and they weren't purely a systems problem either.

## Four Ideas We Killed Before Writing a Line of the Final System

Here's what we considered and rejected — and why each one matters as a lesson, not just a footnote:

- **Supervised fine-tuning.** The obvious first instinct. Rejected immediately — it needs massive GPU clusters and months of runway, not a fixed five-hour, competition-scale budget.
- **Fully agentic search** — a system that breaks a problem into steps, calls tools, verifies intermediate results, and loops back on itself. Conceptually, this is the closest thing to how a human mathematician actually thinks. We rejected it anyway, because Kaggle's environment has no outbound internet access, and an open-ended agentic loop risked silently burning our entire compute budget before ever producing a final answer.
- **Monte Carlo Tree Search.** Not used.
- **Long, verbose chain-of-thought prompting.** We tested it. Concise prompting consistently outperformed it.

The pattern across all four rejections is the same one that ended up defining our whole approach: under a fixed, non-negotiable compute budget, a simpler system you can actually trust beats a theoretically more powerful one you can't fully control.

## The Architecture: A Parallel Self-Consistency Pipeline

What we actually built and submitted, we called a **Parallel Self-Consistency Pipeline**. Here's how a single problem moves through it, end to end:

![Diagram of the Parallel Self-Consistency Pipeline: an AIMO problem enters as LaTeX, passes through a prompt constructor into GPT-OSS-120B, fans out into 8 parallel reasoning attempts each paired with a Python REPL, and converges into an entropy-weighted aggregator that selects the final answer.](/images/aimo3-pipeline-diagram.svg)

1. **The problem** arrives written in LaTeX and gets converted into a structured prompt.
2. **The base model**, GPT-OSS-120B — OpenAI's open-weight mixture-of-experts model, around 120 billion total parameters but only about 5 billion active per token, which is exactly why it fits on a single H100 despite its size — generates a reasoning attempt at temperature 0.8.
3. **The Parallel Sampler** does this eight times, independently, all at once. This is the "self-consistency" idea, and it's built on a real insight from a 2022 paper by Wang et al.: a single reasoning chain can silently go wrong at any step with no way to catch it, but across eight independent attempts, correct reasoning tends to converge on the same answer while failure modes tend to scatter in different directions.
4. **Tool-Integrated Reasoning.** Each of those eight attempts is paired with a live Python interpreter. The moment a reasoning chain hits a calculation it can't reliably do purely in text, it hands that calculation off to Python instead of guessing — a small design choice that removes an entire category of careless arithmetic errors.
5. **The Entropy-Weighted Aggregator.** This is the part I'm proudest of. Instead of a simple majority vote across the eight candidate answers, each one is scored by:

$$\text{score} = \frac{1}{H} + 8.0 \cdot V$$

Here, *H* is the mean generation entropy of that attempt — how "confident" the model was, token by token, while producing it — and *V* is a verifier score. Because the formula uses 1/H, a low-entropy, confident attempt scores higher than a scattered, uncertain one, even if it wasn't the majority answer. There's also an early-stopping rule: if any single answer already has four or more votes, the aggregator stops and submits it immediately, saving compute for the next problem instead of waiting out the clock.

I actually animated this entire pipeline in Manim — every arrow, every fan-out, every step of the aggregation — so you can watch it play out visually instead of just reading a static diagram:

**[Watch the animation: AIMO3 Pipeline, visualized](https://youtu.be/qOPH9anSiw4)**

## From 8/50 to 42/50: What the Climb Actually Looked Like

Our first working version of this pipeline scored 8 out of 50. The final version scored 42. That climb didn't come from one clever trick — it came from three unglamorous things, repeated over and over: systematically diagnosing bugs in the pipeline itself, upgrading the base model as better open-weight options became available, and steadily refining the few-shot prompts feeding into step one.

There's one more data point that told us we were on the right track, and it came after the competition closed. The eventual first-place team's public writeup also centered on GPT-OSS-120B, and their approach was also built around entropy-weighted self-consistency — refined further with things like adaptive runtime scheduling, but directionally the same idea we'd arrived at independently. When a team with more resources converges on the same core mechanism you did, without either of you seeing the other's work, that's a stronger signal than any single benchmark score.

## The One Lesson I'd Give Anyone Building AI Under Real Constraints

Every rejected idea — fine-tuning, agentic search, tree search, verbose prompting — failed for a version of the same reason: it added complexity we couldn't fully control inside a budget we couldn't negotiate. The thing that actually worked was the opposite: precision and reliability over architectural cleverness.

That's not a lesson specific to Kaggle competitions. It's true anywhere you're building an AI system against a real constraint — a latency budget, a cost ceiling, a compliance requirement. The fanciest architecture on paper is worth nothing if you can't trust what it does when the clock is running.

As for the "AI beat the Olympiad" headlines — they're not wrong, exactly. The field genuinely moved from silver-medal level in 2024, to officially certified gold in 2025, to multiple perfect-score claims in 2026, in about two years. I watched a smaller version of that same curve happen inside my own project, going from 8/50 to 42/50 in a few months of iteration. The trend is real. Just read the fine print on "official" versus "self-reported" before you decide how impressed to be by any single claim.

---

*I teach undergraduate mathematics in Chakwal, Pakistan, and I build Manim-animated math content as PlotLab. If you want to learn the exact animation workflow used in the diagram above — from your first `Scene` to a full multi-step pipeline animation — I wrote a complete, copy-paste-ready guide to it: [Manim CE Beginner's Handbook](https://plotlab1.gumroad.com/l/manim_guide_handbook). I'd genuinely like to hear what you think of the pipeline above — reach out or drop a comment.*
