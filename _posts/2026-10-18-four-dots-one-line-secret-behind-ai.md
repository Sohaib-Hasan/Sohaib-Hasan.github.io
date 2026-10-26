---
layout: post
title: "The One Idea Quietly Running Every Prediction App On Your Phone"
thumbnail: /images/blog/linear-regression-apps.png
---

Open your phone right now and check three things. The weather app telling you tomorrow will be 34 degrees. A real estate app showing you what a plot in your area is roughly worth before you even call the agent. Careem or Uber quoting you a fare before the ride has even started.

None of these three apps are guessing. All three are quietly running the exact same two hundred year old idea. It is called linear regression, and once you understand it, in plain words, no formulas needed, you will start noticing it everywhere, every single day.

## You Already Do This Yourself, You Just Never Gave It a Name

Think about the last time you sold an old phone on OLX. You did not pull out a calculator. You looked at what three or four similar phones, same model, similar condition, sold for, and you landed on a number in between. You did the same thing if you ever guessed what a plot of land was worth from nearby sales, or guessed how a student would perform on a final exam after watching how they did on the first two tests.

In every one of these moments, your brain did something specific. It looked at a handful of known examples, noticed the pattern connecting them, and then stretched that pattern forward to guess something it had never actually seen. That instinct, draw a line through what you know and use it to predict what you do not, is the entire idea behind linear regression. You already had it. Computers just do it with numbers instead of a gut feeling.

## Where This Exact Idea Is Quietly Running Your Life

Once you know what to look for, it shows up almost everywhere a company needs to predict a number.

A property website estimates the price of a house by looking at thousands of past sales and finding the pattern between size, location, and price, then applying that same pattern to your house. A ride hailing app quotes your fare before you move an inch by finding the pattern between distance, traffic, and past fares. A bank deciding whether to approve your loan is, underneath the paperwork, running a version of this same pattern between income, history, and repayment. A shopkeeper who orders more stock before Eid because sales always climb in the two weeks before it is doing the same thing by instinct that a supermarket chain's software does with millions of receipts.

Even in my own classroom, when I notice a pattern between how much a student revises and how they score on tests, and I use that pattern to tell a new student roughly what to expect, I am doing exactly this. By hand, with far less data, but the same underlying idea.

## Why This Simple Idea Actually Needed Math

Here is the honest question worth asking. If people have been doing this by instinct for centuries, why did it need to become a formal piece of mathematics at all?

Because instinct breaks the moment the problem gets big or the stakes get real. Ask ten different people to guess the price of a plot from the same five examples, and you will get ten different numbers, because every person draws the pattern through the data slightly differently in their head. That is fine when the cost of being wrong is small. It is not fine when a bank is deciding on a loan for ten thousand people a day, or a property website is pricing a million homes at once, or a hospital is estimating risk for every patient that walks in.

Math solves this by removing the guesswork entirely. Instead of "roughly in between," it gives one exact rule for finding the single best line through any set of data, the one that keeps the total mistake, across every example, as small as it can possibly be. That rule does not change depending on who is using it, does not get tired, does not have a bad day, and does not care whether the data set has five points or five million. A computer can run that exact same rule on a tiny spreadsheet or on the sales history of an entire country, in the same amount of time it takes to blink. That is the actual power math adds here. Not a smarter guess. A guess that can be trusted, repeated, and scaled, without a single person having to eyeball a chart.

## Why This One Idea Is the Grandparent of Modern AI

Here is the part that surprised me the first time I properly understood it. The same core idea, find the pattern that keeps your mistakes as small as possible, is not just used for simple things like house prices. It is the foundation that every modern AI model, including the one writing the text you are reading right now, is built on top of. A giant neural network with billions of parameters is, underneath an enormous amount of extra complexity, still doing a version of the exact same thing a simple line does: adjusting itself, step by step, to make its mistakes smaller, until it finds the pattern that fits best.

Learn this one idea properly, and you have genuinely understood the seed that the entire field of artificial intelligence grew out of.

## For the Curious Few Who Want to See the Actual Math

Most of you reading this do not need to see a single formula to use what you just learned. But a few of you are students, or simply curious people, who want to actually watch how that "best line" gets calculated by hand, with real numbers, step by step, instead of just taking my word for it.

I built a complete animated walkthrough of exactly that, using a tiny four point example you can follow with nothing more than a pen and paper:

**[Watch: Linear Regression, animated](https://www.youtube.com/watch?v=MQzgPcSX0Wc)**

It walks through why the mistakes get measured the way they do, what the resulting pattern actually looks like once you plot it, and the exact two numbers that pin down the one honest line through any set of points, worked out from scratch.

## The Next Time You See a Prediction

The next time an app on your phone quotes you a price, a fare, or an estimate before you have given it much information at all, you will know what is actually happening behind that number. Somewhere in its code is the same idea you already use without thinking: look at what happened before, find the pattern, and stretch it forward to guess what happens next.

It is not magic. It never was. It is just a very old, very patient idea, trusted enough to run quietly behind almost everything that predicts anything, including, in its own distant way, the very phone in your hand.

---

I lead the Mathematics Department at my college, and PlotLab is where I turn ideas like this one into animation. If this kind of explanation helped something click, there is more where it came from on [Facebook](https://web.facebook.com/plotlab1/reels/) (85K+ followers) and [Instagram](https://www.instagram.com/plotlab01/) (15K+ followers). If you're a teacher, student, or researcher who needs an idea explained visually like this, reach out through my [Work With Me](https://sohaib-hasan.github.io/work-with-me.html) page. I'd like to hear what you think, drop a comment.
