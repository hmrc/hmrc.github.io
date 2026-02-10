---
title: Adopt iterative, risk-based approaches
date: 2026-02-03
id: 2
tags:
    - Value focus
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Deliver value early through Minimum Viable Products (MVPs) and fast feedback cycles, applying appropriate testing at the right time to build sufficient confidence.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Motivation

Value for our users is only realised when they can start using the software, so we should try to release that value to them quickly. Our testing approach should be proportional to the risks of doing this -- both in terms of impact to our users and to the organisation -- rather than always applying the same approach in different situations.

Once we have insights from our users, we can better prioritise the remaining incremental improvements based upon both quantitive and qualitative data, rather than relying upon project roadmaps.

<hr class="govuk-section-break--l govuk-section-break--visible">

## Applying this principle

- Work with stakeholders to help them understand the opportunities to release an MVP that can be incremented.
- Ensure that you have repeatable, automated build pipelines that include appropriate automated tests.
- Build, test and deploy small changes frequently to reduce risk and deliver value to end user often.
- Observe user behaviour and the impact of changes, and use this to inform future iterations.
- Optimise for short feedback cycles that allow you to adapt as you learn more about your users.
- Make use of public and private beta releases to gain feedback from real users, early.
- Use techniques such as feature flags, canary releases and A/B testing to control how change is rolled out to users.
- Reduce the reliance upon end-to-end testing by building confidence early through faster, cheaper means of testing including automation.
- Support stakeholders in identifying, understanding, mitigating or accepting the risks of each release.