---
layout: page
title: Data privacy
date: 2025-03-21
id: 1
related:
    sections:
        - title: Related links
          items:
            - text: A guide to the data protection principles - Information Commissioner's Office
              href: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
We all have a responsibility to ensuring we handle user data appropriately, and in line with legislation such as <a href="https://www.legislation.gov.uk/eur/2016/679/contents">UK GPDR</a>.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST limit the people and applications with access to user data](#you-must-limit-the-people-and-applications-with-access-to-user-data)
- [You MUST only capture necessary data](#you-must-only-capture-necessary-data)
- [You MUST only retain data whilst needed](#you-must-only-retain-data-whilst-needed)
- [You MUST apply encryption to sensitive data](#you-must-apply-encryption-to-sensitive-data)

### You MUST limit the people and applications with access to user data

When you are storing user data, you must always identify the people and applications that have access to that data, and strictly limit access to these. This access should also be reviewed periodically. Wherever possible, it is preferable to prevent people access data directly and instead restrict this to applications/tooling that can apply appropriate role-based access control and auditing.

Where data is stored in infrastructure shared across different applications, such as a database cluster, you must ensure access to data is partitioned between different services, for example by per-application credentials, to reduce the risk that one compromised application can leak data associated with another application. To facilitate this, transfers of data between applications should be performed by APIs where possible rather than through shared state in a database or filesystem.

### You MUST only capture necessary data

The data minimisation principle of UK GPDR states that personal data captured must be adequate, relevant and limited to what is necessary. This means you should not gather irrelevant data from users -- you should be able to explain the purpose of all data captured.

You must also ensure that there is a Data Protection Impact Assessment (DPIA) in place for your software and that it accurately describes what data is captured, how it is handled, and how it is used.

### You MUST only retain data whilst needed

The storage limitation principle of UK GPDR states that personal data should be kept for no longer than is necessary. You must understand what this means in the context of your application, put controls in place to ensure this is enforced, and test that these work as expected.

### You MUST apply encryption to sensitive data

Where the risk of data being exposed causes a great risk of harm to individuals, you should apply an appropriate encryption approach. This reduces the risk that any leaked data, for example by compromising a database, is useful to a malicious user as decrypting the data requires a key that is only available to the application. User data should always be encrypted in transit and at rest.
