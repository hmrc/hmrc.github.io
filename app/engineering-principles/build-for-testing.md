---
title: Build with testing in mind
date: 2025-03-21
id: 8
tags:
    - Operational enablers
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
When making technical choices, always consider the implications on how you will test what you are building. Make decisions that enable fast feedback cycles and confidence to be obtained quickly, cheaply and easily.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Motivation

Before releasing software change, we should always have applied appropriate testing to be confident it will work. By embedding testing from the earliest stages of development we can ensure our technical choices support a range of different test approaches, allowing us to make appropriate choices on how to test each change we make.

<hr class="govuk-section-break--l govuk-section-break--visible">

## Applying this principle

- Ensure that your technical choices enable automated testing -- manual testing should be the exception.
- Consider all the appropriate testing approaches you need to apply -- including accessibility and security testing, alongside functional testing.
- For all changes, you should decide on the best way to gain confidence quickly, cheaply and easily -- for example, using unit tests instead of UI-driven tests where possible, or using contract testing to allow integrations to be tested earlier in the development process.
- Run your tests frequently and automatically by using build pipelines.
- You should establish working practices in your team that reduce the amount of duplication across different types of testing.
- Ensure that you have access to appropriate production-like testing environments for the platforms and tools you use, and you understand what different environments can be used for.
- Make sure that you understand the lifespan of any test data and how you will make it available in test environments.
