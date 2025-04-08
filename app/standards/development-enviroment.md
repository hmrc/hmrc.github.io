---
title: Development environments
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
To effectively develop and test an application, an engineer must have access to a suitable development environment. This may run locally on their machine or be hosted in a virtualised environment.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST enable engineers to make changes in an isolated way](#you-must-enable-engineers-to-make-changes-in-an-isolated-way)
- [You MUST enable engineers to run tests against their changes](#you-must-enable-engineers-to-run-tests-against-their-changes)
- [You MUST ensure any virtualised resources are released when possible](#you-must-ensure-any-virtualised-resources-are-released-when-possible)

### You MUST enable engineers to make changes in an isolated way

Engineers must not be prevented from making changes to an application concurrently, to enable changes to be made in a scalable way. This includes being able to isolate changes from each other and run the software to observe the behaviour, without facing contention on environments.

### You MUST enable engineers to run tests against their changes

Enabling engineers to write and run tests against their changes allows them to gain confidence quickly through fast feedback cycles. It also encourages a mentality that everyone is responsible for quality -- testing is not an activity that starts after build is completed. 

### You MUST ensure any virtualised resources are released when possible

If virtual resources are used to host a development environment, these should be released when possible to ensure excessive costs are not incurred.
