---
title: Promote flexibility and reusability
date: 2026-02-10
id: 7
tags:
    - Operational enablers
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
You should be able to choose appropriate tools, practices and approaches for the problem you are solving. Common problems should be solved once through reusable components, allowing you to focus on the specific problems of your service, reducing maintenance effort and improving consistency.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Motivation

By having knowledge of available tools and technologies that can be supported within the organisation, you can make better decisions about which is best suited to the problem you are solving. Using a catalogue of reusable components, you can find shared solutions to common challenges that are robust and well-tested.

<hr class="govuk-section-break--l govuk-section-break--visible">

## Applying this principle

- You should make use of software design patterns such as microservice architectures that enable you to develop, deploy and scale different parts of your service independently, and improves potential re-use.
- When designing the architecture of your service, consider how parts of your service may be reusable by others by exposing appropriate APIs.
- Ensure that any APIs your service does expose are documented appropriately such that they can be discovered and understood easily by other teams.
- Before developing your service, consider how you might be able to reuse existing services and components to reduce the need for repeated work.
- Try to avoid premature abstractions that tightly couple different services together unnecessarily.
- When building reusable components, ensure you have a sustainable way to support updating, documenting and maintaining them.
- Ensure that your governance processes allow appropriate innovation and experimentation, whilst ensuring organisational standards are still considered.
