---
layout: post
title: "I Built My Students an AI Assistant That's Not Allowed to Make Things Up"
---

Ask a generic AI chatbot a question about your course, and it will answer confidently, using its own notation, its own conventions, and occasionally its own facts. It doesn't know that you define a term slightly differently than the textbook does, or that a particular proof technique hasn't been covered yet, or that the "obvious" shortcut it just suggested isn't one your students are allowed to use on the exam. It will still answer. That's the problem.

I teach undergraduate mathematics, and every semester the same pattern repeats: a handful of students ask sharp, specific questions in office hours, while dozens more ask ChatGPT the same questions late at night, when I'm not there to catch the moment an AI politely gets something wrong. So I built something that only answers from my own course notes, refuses to guess when it doesn't know, and, as a side effect, shows me exactly where an entire class is actually getting stuck. It's called **Classroom AI System**, and the code is public: [github.com/Sohaib-Hasan/classroom_ai_system](https://github.com/Sohaib-Hasan/classroom_ai_system).

## Grounded, Not Generic

The technical name for what makes this different is retrieval-augmented generation, RAG for short. Instead of asking a language model to answer from everything it was trained on, the system first retrieves the exact passage from my own LaTeX course notes most relevant to a student's question, then instructs the model to answer strictly from that passage and nothing else. Right now the knowledge base covers Calculus, Discrete Mathematics, and Number Theory, chunked chapter by chapter from the same notes I hand out in class.

The system is two separate apps sharing one brain:

- A **student assistant**, PIN-gated, where students type a question and get an answer grounded in the actual notes.
- A **teacher dashboard**, password-gated, where I see what's being asked across the whole class: which topics come up again and again, which questions the cache is already handling, and where the same confusion is repeating across different students.

## How a Question Actually Gets Answered

![Diagram showing the Classroom AI System's two-stage pipeline: course notes are chunked, cleaned, and embedded into a knowledge base offline, then at runtime a student question is matched against that knowledge base and answered by Gemini, with every question logged for the teacher dashboard.](/images/classroom-ai-pipeline-diagram.svg)

Getting from ".tex notes" to "trustworthy answer" happens in two stages. The first, indexing, happens once, offline, whenever my notes change:

~~~
python3 chunk_notes.py      # .tex notes  ->  raw chunks (one per definition/example/theorem/proof)
python3 clean_chunks.py     # strips decorative LaTeX, keeps the real math
python3 embed_chunks.py     # embeds every cleaned chunk into knowledge_base.json
~~~

The second stage happens live, every time a student asks something: the question gets embedded and compared against the knowledge base by cosine similarity, the closest matching chunks get pulled out, and only those chunks, together with the question, get sent to Gemini for an answer.

## The Step That Almost Broke Everything

The middle step, `clean_chunks.py`, sounds like the least interesting part of the pipeline. It's the one that mattered most.

`chunk_notes.py` extracts each definition, example, or theorem box straight out of the raw `.tex` source, decorative markup and all: color commands, tables, diagram code, spacing macros. That raw text becomes part of the prompt the model sees for every question. Skip the cleaning step, and the model will occasionally echo a fragment of that raw markup straight back to a student, so instead of a clean explanation they see broken LaTeX code on their screen. `clean_chunks.py` strips all of that decoration out while leaving the real `$...$` math completely untouched, so the model only ever sees the content, never the formatting noise around it. It's a small, unglamorous script, and the whole system's credibility depends on it running before every embedding pass.

## Making It Work on a Budget of Exactly $0

This runs entirely on Gemini's free tier, which means every question costs quota, and quota is the actual scaling limit. A few decisions keep that from becoming a wall:

- **Multi-key rotation.** Gemini's rate limits apply per Google Cloud project, not per key, so keys from separate accounts draw from independent quota pools. The system supports up to three keys and falls through to the next one only if a call fails, invisibly to the student asking the question.
- **Caching.** A SQLite-backed cache means a rephrased version of a question someone already asked skips the generation call entirely, which matters a lot in a class where dozens of students hit the same handful of confusing topics.
- **Local embeddings.** Every question needs an embedding call, even on a cache hit, which makes it the single biggest quota consumer in the whole system. Swapping the embedding provider to a free local model removes that cost entirely, at the price of having to rebuild the knowledge base once, since Gemini and local embeddings aren't compatible with each other.
- **A per-session rate limit.** Eight questions per rolling 60 seconds per browser session, mostly as a safety net against an accidental double-submit rather than a real constraint on normal use.

## Two Apps, One Shared Brain

The student assistant and the teacher dashboard are deployed as two separate Streamlit Cloud apps, on two different URLs, each running in its own isolated container. That last part turned into the trickiest infrastructure problem in the whole project: a local SQLite file that one container writes to simply doesn't exist for the other one.

![Diagram showing the student assistant and teacher dashboard as two separate, isolated Streamlit Cloud deployments that both read the shared knowledge_base.json and both read and write to a shared Turso database for the question log.](/images/classroom-ai-architecture-diagram.svg)

The fix is [Turso](https://turso.tech), a free, hosted, SQLite-compatible database that both apps point to instead of their own local files. Two details in that setup cost real debugging time and are worth writing down: the connection string has to use `https://`, not `libsql://`, because the WebSocket handshake `libsql://` relies on can fail inside Streamlit Cloud's sandboxed environment, and the secret key has to be named exactly `TURSO_AUTH_TOKEN`. Get either of those wrong and there's no crash, no error message, just a dashboard that stays quietly empty with nothing to explain why.

## What the Teacher Actually Sees

This is the part that matters most to me as a teacher, and it's the part a generic AI chatbot can never give you. Office hours show me the questions the handful of students who show up are willing to ask out loud. The dashboard shows me every question the whole class actually had: which topic keeps coming back, which confusion is repeating across students who've never spoken to each other, what the cache is already absorbing versus what's genuinely new. It's the difference between a handful of anecdotes and an actual signal.

## Built to Not Break Quietly

The business logic lives in `core.py`, which deliberately has no dependency on Streamlit at all, so it can be tested completely independently of the app itself. Right now it's backed by 91 automated tests, and every one of them exists because a specific bug was found and fixed, not because of abstract coverage targets. One example I'm particularly fond of: the system's `verify_computation()` check samples the negative, positive, *and* near-zero domains of a function, not just the positive ones, specifically because a positive-only check would miss domain-sensitive errors like treating `sqrt(x**2)` as equal to `x`, which only holds when `x` is non-negative. That's the kind of bug that looks fine in a quick demo and quietly produces wrong math for a student six weeks later.

## Where It's Still Rough

A few honest limitations, because a system that grades student proofs owes its builder the same standard: nested LaTeX boxes of the same type (a definition box inside another definition box) aren't parsed cleanly yet, though a safety check flags this loudly the moment it happens rather than letting it reach a student silently. The automated cleaning handles the large majority of decorative LaTeX but not all of it: roughly 3% of chunks, mostly color commands sitting inside real math, still need a manual look. And there's an optional third-party fallback provider for when every Gemini key is exhausted that I've built but haven't yet stress-tested in production, so for now it's a safety net I wouldn't lean on.

## What's Next

The next thing I'm building on top of this is a guided answering mode: instead of jumping straight to a full solution, the system will offer a hint first, then a guiding question, and only give the complete answer if the student actually wants it. The goal was never to hand out finished proofs faster. It's to get a student unstuck without doing their thinking for them.

That's really the whole premise behind this project, and behind the broader direction I want to take my teaching: AI that's useful specifically because it's constrained, not despite it.

---

I lead the Mathematics Department at my college and build tools like this one alongside my Manim animation work as PlotLab. If you teach and are curious whether something like this could work for your own courses, or if you'd like help building it, reach out. I write more like this at [sohaib-hasan.github.io](https://sohaib-hasan.github.io), and if you want to see the kind of animated explanations I build separately from this project, they're on [Facebook](https://web.facebook.com/plotlab1/reels/) (35K+ followers) and [Instagram](https://www.instagram.com/plotlab01/) (15K+ followers). I'd like to hear what you think, drop a comment.
