---
layout: page
title: Version control
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Effective use of a version control system requires agreement around how it will be used, including considering the specific context for an application.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST ensure you can always build an artefact from your source code](#you-must-ensure-you-can-always-build-an-artefact-from-your-source-code)
- [You MUST have an effective way to enable multiple contributors](#you-must-have-an-effective-way-to-enable-multiple-contributors)
- [You MUST enforce commit signing on repositories](#you-must-enforce-commit-signing-on-repositories)
- [You MUST prevent direct changes to the "main" branch](#you-must-prevent-direct-changes-to-the-main-branch)
- [You MUST define and adhere to a branching strategy ](#you-must-define-and-adhere-to-a-branching-strategy)
- [You MUST have a plan for rolling back or fixing forward](#you-must-have-a-plan-for-rolling-back-or-fixing-forward)

### You MUST ensure you can always build an artefact from your source code

The "main" branch of your source code should always be able to be built into an artefact that can be deployed. This means that new or changed functionality should not be merged into your code until the work on it is completed and has been tested appropriately.

You may want to consider the use of configuration such as "feature flags" to enable you to merge changes into your code without making those changes effective until a subsequent point in time when they can be enabled through configuration values.

### You MUST have an effective way to enable multiple contributors

Version control systems are very effective at highlighting situations where changes to the same repositories by different authors cannot be combined. However, you must understand how to resolve these safely in the context of the technology you are using, or otherwise avoid them through -- for example, through effective communication within the team. If this is difficult to achieve with the technology or platform you are using, it will become significantly worse as the number of contributors increases.

### You MUST enforce commit signing on repositories

Commit signing makes use of public/private key cryptography to give extra confidence that code changes are being committed by an authorised individual, by adding a cryptographic signature with the changes. This signature can be verified by the version control server, which can reject any changes with invalid or missing signatures. At a minimum, commit signing should be enforced on all branches that are used to build and deploy artefacts to deployed environments.

### You MUST prevent direct changes to the "main" branch

Changes to a "main" branch should be prevented until appropriate processes, such as code reviews and automated tests, have succeeded. This helps to ensure that this branch is always in a buildable and deployable state, and also prevents a single user from making a change by themselves.

### You MUST define and adhere to a branching strategy 

Different platforms and toolsets may constrain the branching strategy that you apply, for example a trunk-based workflow or a feature branch workflow. You must ensure that you follow a consistent strategy for the platform, technology and tools that you make use of. This should be documented to ensure the approach is well-understood and agreed by all team members.

### You MUST have a plan for rolling back or fixing forward

When making changes or adding functionality, you must always consider how you can resolve any unexpected issues found during or after deployment.

If you intend to roll back changes, you must consider how this affects users who may have already started using the updated version, including any state that may be externalised into a database.

If you intend to fix forward, you must ensure your approach to version control and specifically branching caters for this. For example, you may need to create "hotfix" versions of a branch that may be based from a point in the version history that is no longer the same as the "main" branch.
