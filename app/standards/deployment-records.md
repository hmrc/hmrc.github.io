---
title: Deployment records
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
By maintaining records around deployments, you are able to accurately determine what software and configuration was in place at a given time. This is important when investigating issues and provides an audit trail around changes.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST version software artefacts that are deployed](#you-must-version-software-artefacts-that-are-deployed)
- [You MUST version configuration files that are deployed](#you-must-version-configuration-files-that-are-deployed)
- [You MUST capture who triggered a deployment event, how and when](#you-must-capture-who-triggered-a-deployment-event%2C-how-and-when)
- [You MUST capture information about how the deployment process has executed](#you-must-capture-information-about-how-the-deployment-process-has-executed)
- [You MUST retain deployment records for an appropriate duration](#you-must-retain-deployment-records-for-an-appropriate-duration)
- [You MUST protect deployment records from tampering](#you-must-protect-deployment-records-from-tampering)

### You MUST version software artefacts that are deployed

Using versioned artefacts for software deployments makes it easier to reason about the expected behaviour of an application, makes it easier to investigate defects, and is a key part of repeatable build pipelines.

### You MUST version configuration files that are deployed

Configuration combines with application code to determine the behaviour of software. Therefore deployments of configuration must also be versioned and deployments recorded to provide a full understanding of how the application is expected to behave.

### You MUST capture who triggered a deployment event, how and when

Storing this information allows you to understand why a deployment has been made. This allows auditing of this information and proper attribution of responsibility for changes.

### You MUST capture information about how the deployment process has executed

Deployments should usually succeed but may sometimes fail. When a deployment fails, there should be sufficient information to understand why and what state the application has been left in (for example, has a rollback occurred automatically).

### You MUST retain deployment records for an appropriate duration

Issues caused by deployments may not be noticed until a protracted time afterwards, especially in complex systems. Therefore, records should be retained for an appropriate length of time to enable investigations to be undertaken.

You may be asked to use deployment records as part of evidence for legal challenges from users and should therefore determine the duration based on the likelihood of this within your context.

### You MUST protect deployment records from tampering

To ensure accuracy of deployment records, they should be stored in a way that it is very difficult to modify or tamper with them.
