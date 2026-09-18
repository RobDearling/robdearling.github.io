---
title: 'Communication Doesn’t Have a Compiler'
date: '2026-09-18'
summary: 'I have spent most of my career learning to make computers understand exactly what I mean. Now, in an architecture role, I am trying to become better at doing the same thing with people.'
---

I didn’t do well at school.

I just knew school seemed to measure me on the things that I wasn’t good at. English was one of those things. Writing was never something I enjoyed and I never thought of myself as a good communicator.

For most of my career, being a good communicator didn’t matter. If I could write the code and it did what it was supposed to, then I was successful.

Software made sense. There were rules. If I wrote something incorrectly, the compiler would instantly tell me. If my code didn’t behave as expected, my tests would fail. Linters would point out problems before I had even finished writing the code. Eventually, my code would end up in a pull request and someone else would review it.

> “Could we name this more clearly?”
>
> “This class is doing too much.”
>
> “Have you thought about abstracting this?”

I had a feedback loop and something I could improve on. We are constantly being told how our code could be clearer, tidier and less complex, but we rarely get that feedback with communication. Code has a feedback loop; communication often doesn’t.

## Communication doesn’t have a compiler

Since I’ve moved into the architecture role, I’ve realised that having the right technical answer is not enough.

I need to explain why I think it’s the right answer. I need to write down decisions that someone is going to understand six months later. And sometimes I need to take something I’ve been thinking about for days and explain it clearly in five minutes.

That’s the bit I’ve found difficult: you can communicate poorly and never know.

## We was

One of the moments that made me realise the weakness I’ve been able to get away with for a while was a regular conversation with my manager.

I’d sent my manager a message written something along the lines of:

> “We was going to do…”

He corrected me:

> “We were.”

That’s it. Barely a life-changing event, but for some reason it stuck with me. How many times had I written that before? *(Hint: a lot.)* Nobody had corrected me, and why would they? If someone understands the message, they aren’t going to add a review comment:

> “Nit: ‘we were’ might be a better read here.”

They will understand what I mean and carry on with their day. That created an interesting problem for me: how could I get better at something if there was no feedback loop?

If I write bad code, there’s a good chance someone will catch it before it hits live.

I can write a sentence that’s grammatically correct — often it’s not — but difficult to understand.

There is no:

```text
CommunicationException: Reader didn’t understand paragraph 2
```

Although I’d quite like one.

## Where are the rules?

Software engineering has some pretty fundamental rules you can follow. Language, not so much.

What I really want is the SOLID principles of communication.

> “Do this.”
>
> “Don’t do that.”
>
> Follow these five golden rules and your communication will be clear.

What I’ve found is that communication is a lot messier than that.

There are principles. Cut unnecessary filler words, give context and think about the target audience. The ideas help, but they’re not compiler rules.

Sometimes a long sentence works; sometimes a short sentence doesn’t. Sometimes technical terminology makes something clearer; sometimes that same terminology makes your explanation worse.

- Context matters.
- Audience matters.
- Purpose matters.

## What I’m doing about it

I’m still early on in this journey and I’m not sure I’ll ever get it right. It’s partly why I’m writing this blog post now rather than waiting until I feel like I’ve “solved” it.

I’m trying to slow down before I send something. I’m thinking a lot more about what I’m actually trying to say. I’m reading things back and asking whether it’s clear what I’m trying to communicate.

## Final thoughts

For most of my career, I’ve been learning to make computers understand exactly what I mean. Now I’m trying to do the same thing with people.

I’m aware this blog post is probably full of errors. There are probably sentences that are difficult to follow and bits I’ll look back on in six months and wonder what I was trying to say.

I could throw the whole thing into an LLM and ask it to make it clearer. It would probably fix most of those problems. But I’m not sure I’d actually get any better at writing.

What I need is the feedback loop, not something to do it for me.

Otherwise, I’m just becoming a meat proxy.
