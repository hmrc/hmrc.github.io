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

- Ensure that technical choices enable and encourage automated tests as the default choice.
- For all changes, decide on the best way to gain confidence quickly, cheaply and easily -- for example, applying unit tests instead of UI-driven tests where possible.
- Establish working practices in your team that reduce the amount of duplication across different types of testing.
- Use build pipelines to run regression tests frequently and automatically.
- Provide appropriate production-like testing environments for all platforms and tools, considering the lifespan of these and how test data will be made available.
