---
title: Configuration management
date: 2025-04-22
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Configuration is used to change the behaviour of software without changing the underlying code. Poorly managed configuration can cause problems just as easily as poorly managed code. 
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST use version control for all configuration](#you-must-use-version-control-for-all-configuration)
- [You MUST record what the current configuration state is](#you-must-record-what-the-current-configuration-state-is)
- [You MUST test configuration changes](#you-must-test-configuration-changes)
- [You MUST ensure configuration changes are reviewed](#you-must-ensure-configuration-changes-are-reviewed)
- [You MUST consider when code is more appropriate than configuration](#you-must-consider-when-code-is-more-appropriate-than-configuration)

### You MUST use version control for all configuration

Version control allows you to see what changes were made, by who, and when. In some contexts it can also enable multiple people to safely contribute to the same configuration. Version control also facilitates rolling back changes in the event of failed deployments, by defining the previous known working configuration state.

### You MUST record what the current configuration state is

To be able to effectively investigate problems, it must be easy to understand what configuration is currently in place in a given environment. By combining this with information about what software version is deployed this greatly increases the likelihood that the problem can be reproduced, allowing potential fixes to be properly tested.

### You MUST test configuration changes

If software is incorrectly configured, it will not behave as expected. When changing configuration you must think about how best to test that change -- for example, through automated or manual testing, as appropriate. This could be performed in a local development environment or a deployed pre-production environment.

Some configuration will be specific to a single environment, such as usernames, passwords, and cryptographic keys. In these cases, you should have proven that the configuration values change the software behaviour as expected -- such as by testing that values are passed through to API requests in integration tests -- and then know what observability tooling you will use to confirm the configuration is correct once deployed.

### You MUST ensure configuration changes are reviewed

As with code changes, you must ensure that all changes to configuration are reviewed by multiple people. This reduces both the risk of mistakes being made and of unauthorised changes being made.

### You MUST consider when code is more appropriate than configuration

Configuration is typically harder than code to test effectively and efficiently, as it usually has to be tested at a much higher level of abstraction. Specifying complex behaviour through configuration increases the risk of bugs being introduced, especially when the interaction between complex configuration and code needs to be considered.
