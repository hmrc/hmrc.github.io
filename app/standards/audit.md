---
layout: page
title: Auditing
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Capturing audit information is essential for many different types of software. It helps us maintain a record of how internal and external users have interacted with it, which is important for activities such as non-repudiation and regulatory compliance.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST capture audit information from user interactions](#you-must-capture-audit-information-from-user-interactions)
- [You MUST store audit information securely](#you-must-store-audit-information-securely)
- [You MUST agree the length of time you keep audit data](#you-must-agree-the-length-of-time-you-keep-audit-data)
- [You MUST protect audit information from modification or tampering](#you-must-protect-audit-information-from-modification-or-tampering)

### You MUST capture audit information from user interactions

When a user interacts with your software you must store a record of this. This must detail the time of the interaction, information about the user, and what action they took. It may also include additional metadata, such as a session identifier that helps correlate multiple events together to describe a set of actions.

### You MUST store audit information securely

Due to the detailed nature of audit data it will usually constitute personally identifiable information (PII). You must therefore take appropriate steps to store it securely, such as only providing access to a limited number of users and monitoring their access to the data. If data relates to individuals outside of HMRC, you may need to restrict access to individuals holding certain levels of security clearance.

### You MUST agree the length of time you keep audit data

The length of time you store audit data for must be agreed with your security information business partner (SIBP) and in collaboration with your stakeholders. You must put in place processes that ensure data is removed after this length of time.

### You MUST protect audit information from modification or tampering

Audit information forms an important record of events which may form part of evidence for events such as disciplinary meetings or tribunals. It is therefore essential that audit data is sufficiently protected from modification or tampering to be considered sufficiently reliable as a truthful record of what happened.
