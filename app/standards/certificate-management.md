---
layout: page
title: Certificate management
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Digital certificates can be used in a number of ways to improve security, however they must be managed appropriately to achieve this and to avoid unexpected service outages.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST monitor when certificates will expire](#you-must-monitor-when-certificates-will-expire)
- [You MUST use different certificates for different environments](#you-must-use-different-certificates-for-different-environments)

### You MUST monitor when certificates will expire

Digital certificates can have varying validity lengths. When they become invalid, they will no longer be trusted and may cause issues such as failed authentication, leading to service outages.

You must make sure you understand when certificates are valid until and renew them ahead of time to avoid downtime. You should be aware of how long the renewal process will take, which depends upon how they are issued for your use case.

### You MUST use different certificates for different environments

Test environments and production environments may have very different security controls. For example, an engineer may be able to gain access to lower level logging and audit information in a test environment without a specific clearance level. If the certificates or credentials that secure connections between services are shared between test and production environments, this increases the risk of a security incident in production.
