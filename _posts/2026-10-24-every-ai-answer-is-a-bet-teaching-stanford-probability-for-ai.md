---
layout: post
title: "Every AI Answer Is a Bet: What I Learned Teaching Stanford's Probability for AI"
thumbnail: /images/blog/stanford-probability-for-ai.png
---

Ask an AI a question and watch the words arrive, one after another. It feels like the machine is looking something up. It is not. At every step, the model is placing a bet. Given everything written so far, it assigns a probability to each possible next word, picks one, and moves on. The paragraph you finally read is a chain of weighted guesses, and the quality of the whole answer depends on how well those guesses were calibrated. It is also why asking the same question twice can give you two different answers.

If that sounds strange, it should. We are used to computers being certain. A calculator never hesitates over 7 times 8. But the systems now writing our emails, reading our medical scans and ranking our search results work differently. They live inside uncertainty, and the mathematics of living inside uncertainty is probability.

That is why a Stanford course called Probability for AI exists, and why I am proud to be a small part of it.

## The Course in One Paragraph

[Probability for AI](https://pai.stanford.edu) is a free online course created by Chris Piech, an Assistant Professor (Teaching) of Computer Science at Stanford and a Faculty Affiliate of Stanford HAI, the university's institute for human-centered AI ([his Stanford profile](https://profiles.stanford.edu/christopher-piech)). Piech describes it as a course that teaches you "the math language that AI speaks." Stanford HAI describes it as a [six-week program](https://x.com/StanfordHAI/status/2099882630418485584) for anyone who wants to understand how AI works, not just how to use it, with no prerequisites and no experience needed.

I like that framing, because "not just how to use it" is the whole point. Anyone can type a prompt. Understanding why an answer came out the way it did, why it is sometimes confidently wrong, and how much to trust it, requires the language of probability. And although the course welcomes beginners, it does not stay shallow. In my section, we go deep into how probability actually does its work inside AI.

## How I Ended Up in the Room

I was selected as a section leader out of more than 2,700 participants from over 70 countries. A section is a small group where students work through the week's ideas together and get to ask questions. Mine is made up of working professionals and technologists from around the world.

I will be honest about what this takes. I do it alongside a full-time job and all the usual weight of daily responsibilities, and it asks for real effort every single week. But I am enjoying this journey seriously, and being trusted to teach in a Stanford course is an honor I do not take lightly.

## One Question That Shows Why Probability Matters

Before I tell you about the weeks themselves, try this one. It is the kind of question the course trains you to answer correctly.

A medical screening test catches 95 percent of people who have a certain condition. It also gives a false alarm for 5 percent of healthy people. The condition affects 1 percent of the population. You take the test and it comes back positive. What is the chance you actually have the condition?

Most people say about 95 percent. The real answer is about 16 percent.

Here is why. Imagine 10,000 people. Of them, 100 have the condition and 95 of those test positive. Of the 9,900 healthy people, 5 percent, which is 495, also test positive. So among the 590 people with a positive result, only 95 are truly sick. That is roughly one in six.

Nothing in that calculation is advanced. Yet our intuition gets it badly wrong, and the same mistake hides inside AI systems that flag fraud, detect disease or screen applicants. Learning to think this way is not a luxury for mathematicians. It is basic literacy for anyone who will live alongside AI.

## Week 1: Same Prompt, Twice

Week 1 opened with something every AI user has quietly noticed: ask the same question twice and you may get two different answers. Why?

In our section, we explored it with a toy language model small enough to hold in your head. Give it the prompt "A sleepy robot dreams about" and it has exactly five possible outputs: electric sheep (44 percent), counting stars (20), sample spaces (14), counting outcomes (13) and robot puppies (9). Each call picks one at random, independently of the last.

So what is the chance that two calls give two different outputs? Three simple rules are enough: NOT, OR and AND. The chance that both calls give the same output is the sum of each output's probability squared, which comes to 0.2782. The chance of two different outputs is 1 minus that, about 72 percent. Even a model with a clear favorite disagrees with itself most of the time.

Then came a question that catches almost everyone. "Robot puppies" appears with a 9 percent chance on each call. How many calls until you are more likely than not to see it at least once? The tempting answer adds the chances: six calls, 6 times 9 percent, is 54 percent. But those chances overlap, so adding them overcounts. The right way is to ask for the chance of never seeing it. That is 0.91 on each call, so 0.91 multiplied by itself n times. After six calls the real chance is only 43 percent. It takes eight calls to pass 50 percent.

Finally, we met the dial that every AI tool hides behind a slider: temperature. It raises each probability to the power 1/T and rescales them so they add up to 1. Look at the first word the model writes. "Electric" starts at 44 percent. Turn the temperature down to 0.5 and it climbs to about 59 percent, while "robot" shrinks from 9 percent to about 2.5 percent. Two calls now start with the same word about 46 percent of the time, up from 33 percent. Turn the temperature up to 2 and the chances even out: "electric" falls to about 35 percent, "robot" rises to about 16 percent, and two calls match only about 27 percent of the time.

The randomness setting in an AI tool is not magic. It is probability, rescaled.

I turned this section into a detailed solutions PDF with every step worked out, and a Manim animation so that students could revisit the ideas at their own pace, long after the live session ended.

## Week 2: The Palpatine Poll

In Week 2, our section centered on a problem called the Palpatine Poll, and it was my favorite kind of problem: simple mathematics wrapped around a clever idea.

The question is how you measure something people will not say out loud. Suppose you want to know what fraction of people hold an unpopular or embarrassing opinion. If you ask directly, many will hide the truth. The trick is called a list experiment. Split people into two groups. Show the first group a list of a few harmless statements and ask only how many they agree with, never which ones. Show the second group the same list with one sensitive statement added, and ask the same question. Nobody reveals a single individual answer, yet the second group's average count comes out higher, and that gap estimates how many people agree with the sensitive statement.

Underneath this trick sit two of the most useful ideas in probability. A single yes or no answer is a Bernoulli random variable, the simplest random event there is. Add up many of them and you get a binomial distribution, which tells you not only the expected count but also how much it is likely to wobble from one group of people to the next. That wobble is what separates a trustworthy estimate from a lucky one.

Here is where AI enters. Every time a team reports that a model is "90 percent accurate," they are reporting a binomial experiment: run the model on n test examples and count how many it gets right. Treat each test example as an independent trial with a 90 percent chance of success. On 100 examples, the number correct will land anywhere from about 84 to 96 in roughly 97 out of 100 runs. On 10,000 examples, the same model will land within about 0.6 of a percentage point of 90 percent, about 95 percent of the time.

Same model, same skill, wildly different certainty. Whether a headline number deserves your trust depends on a calculation most people never see.

## Making the Hard Parts Visible

After each week, I do something extra. I write a detailed solutions PDF, and I build a Manim animation that shows the idea moving, not just written down. After Weeks 1 and 2, I shared both with my students and posted them on the section leaders' forum so that every section leader could use them too.

The reaction was the best surprise of the whole experience. Prof. Chris Piech replied to my post, calling a Manim video for Week 2 a real gift to students and to every section leader in the course, and a fellow section leader added kind words as well.

<!-- ADD YOUR SCREENSHOT: save the image as /images/chris-piech-comment.png in your site folder (crop to the post and comments, blur anyone else's name or photo if you prefer). The line below will then display it. -->
![Prof. Chris Piech's reply to my Manim animation for Week 2 of Probability for AI](/images/chris-piech-comment.png)

I mention this less to celebrate than to make a point about how hard ideas actually get learned. A formula on a slide asks you to trust it. An animation lets you watch the reason. When a binomial distribution widens and narrows as you change the number of trials, it stops being a symbol and becomes something you have seen. That has been true in my own classroom as well, and it is why I animate everything I can.

If you want to explore the material yourself:

- **Detailed PDFs for Week 1 and Week 2:** [open the folder](https://drive.google.com/drive/folders/1iwzGMDo9XQ4w8h1BXhQzgaGV9Zx0O4pO?usp=sharing)
- **The animation playlist:** [Stanford Probability for AI on YouTube](https://www.youtube.com/playlist?list=PLUR1g6hiXfoQ)

## What I Am Taking Away

Teaching this course has changed how I read AI headlines. When I see that a model is "accurate," I ask how many examples it was tested on. When a system is described as "confident," I ask whether that confidence is calibrated. When someone says an AI "knows" something, I remember that it placed a bet.

That habit of asking is worth more than any single formula, and you do not need to be a mathematician to build it. You need a good teacher, a few well chosen examples, and the patience to look at an idea until it moves. If you want to see where this course lives, it is at [pai.stanford.edu](https://pai.stanford.edu).

---

**About the author**

I'm Sohaib Hasan. I have 9+ years of teaching experience in advanced mathematics and statistics, and I turn the ideas I teach into Manim animations, the kind that Prof. Chris Piech and fellow section leaders of Stanford's Probability for AI have appreciated.

I share these animations on my YouTube channel, [PlotLab Algorithms](https://www.youtube.com/@PlotLabAlgorithms), where I teach data science, machine learning, cryptography, math, DSA and statistics visually, in the style made popular by 3Blue1Brown. Shorter clips live on [Facebook](https://web.facebook.com/plotlab1/reels/) (85K+ followers) and [Instagram](https://www.instagram.com/plotlab01/) (15K+ followers).

**Want an animation like this for your own work?** If you have a project, a research article, a thesis defense, a YouTube video, or any idea that is hard to explain with slides alone, I can turn it into a clear, professional animation. Reach out through my [Work With Me](https://sohaib-hasan.github.io/work-with-me.html) page and tell me what you are working on. If you would rather learn to build animations yourself, start with my [Manim CE Beginner's Handbook](https://plotlab1.gumroad.com/l/manim_guide_handbook). And I'd like to hear what you think of this post, drop a comment.
