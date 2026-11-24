---
title: 'Make your pull request easy to approve'
date: '2026-11-24'
summary: 'A diff shows reviewers what changed. A good PR description explains why it changed.'
---

Recently I've been thinking about why PRs take so long to merge. As we adopt agentic engineering, we're generating more code and raising more PRs. But generating changes faster doesn't necessarily help reviewers understand them faster.

A diff shows what changed. A useful PR description explains why.

In an interesting article, [Most Reviews Should be Approvals](https://seangoedecke.com/good-code-reviews/#most-reviews-should-be-approvals), Sean Goedecke argues that most people should lean towards approving PRs unless there are mitigating circumstances.

As we adopt agentic engineering more widely, the amount of code we churn out is increasing, along with the number of PRs we are raising.

## The AI PR

Copilot has a *great* feature that allows you to generate a PR summary and saves you tons of time writing a PR description. You can automate all the way from code to PR creation. Great... Right? Well, we have seen the number of PRs increase, but we haven't necessarily seen the time to approval decrease.

Let's take a look at this diff:

```hcl
 resource "aws_route53_record" "api" {
   zone_id = var.hosted_zone_id
   name    = "api.example.com"
   type    = "A"
-  ttl     = 3600
+  ttl     = 300
   records = [var.api_ipv4_address]
 }
 ```

Would you approve this PR? I wouldn't. I don't have the context of why it's changing. Great, Copilot to the rescue... Right?

Copilot PR Description:

> This pull request introduces a change to change the TTL of the AWS Route 53 A record for api.example.com from 3600 to 300.
>
> Changes:
>
> - AWS Route 53 Record
> - API
> - TTL 3600 -> 300
> - Change on api.example.com

![What does that even mean?](/images/brooklyn99-brooklyn-nine-nine.gif)

The summary tells me what changed, but not why. Without that context, it hasn't answered the question blocking my review. Reading the description took me longer than just checking the diff that gave me the same value.

The next natural step I would take is to ask the engineer who raised the PR why we are making the change. We are now context switching, and I'll likely come back to the PR later today or tomorrow.

Now, if the same PR description were created with the context for the change, it might look something like this:

> We are moving the api.example.com endpoint to a new IP address. I'm lowering the TTL in a separate PR because DNS resolvers can keep an answer they've already cached for the full hour. We need to apply this change at least an hour before we switch the IP. I chose 5 minutes because that's how long we're comfortable with a resolver continuing to return the new IP if we need to roll back.
>
> Once we are happy with the migration, I'll put the TTL back to an hour to keep the volume down.

This description clearly tells me:

- Why we are making the change
- What we have thought about whilst making the change
- What the risks of the change are
- What the next steps are, if any

I can now assess the change against its purpose, rather than pause the review to ask why it's needed.

## Thoughts when creating a PR

Before requesting a review, I ask:

- Have I explained why this change is needed?
- Have I explained the decisions a reviewer might question?
- Have I described the relevant risks, validation, and any rollback or follow-up work?

The goal isn't a longer description. It's fewer unanswered questions.
