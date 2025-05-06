---
layout: page
title: Dependency management
date: 2025-04-25
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Managing the dependencies of your software code is a key part of ensuring it is maintainable and secure.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST version all software dependencies](#you-must-version-all-software-dependencies)
- [You MUST consider the suitability of new dependencies](#you-must-consider-the-suitability-of-new-dependencies)
- [You MUST consider the benefits of each dependency](#you-must-consider-the-benefits-of-each-dependency)
- [You MUST be able to produce a list of all dependencies](#you-must-be-able-to-produce-a-list-of-all-dependencies)
- [You MUST keep dependencies up to date](#you-must-keep-dependencies-up-to-date)
- [You MUST monitor your dependencies for vulnerabilities](#you-must-monitor-your-dependencies-for-vulnerabilities)
- [You MUST consider the impact of vulnerabilities in your dependencies](#you-must-consider-the-impact-of-vulnerabilities-in-your-dependencies)
- [You MUST prevent known vulnerable dependencies being used](#you-must-prevent-known-vulnerable-dependencies-being-used)
- [You MUST test your software appropriately after updating a dependency](#you-must-test-your-software-appropriately-after-updating-a-dependency)
- [You MUST store all software artefacts in a suitable repository](#you-must-store-all-software-artefacts-in-a-suitable-repository)
- [You MUST fetch the software artefacts for your dependencies from a trustworthy source](#you-must-fetch-the-software-artefacts-for-your-dependencies-from-a-trustworthy-source)

### You MUST version all software dependencies

Versioning of software dependencies ensures that software builds are reproducible and identify exactly the code that was included for a given version of your software. It is also important to help manage how updates and changes are integrated into your own application.

### You MUST consider the suitability of new dependencies

Introducing a new dependency to your code will make you reliant upon its contributors for future updates, including on their ability to identify and resolve security issues.

Before introducing a dependency, you must review how actively it is maintained -- for example, by reviewing the number of contributors or the organisations that maintain it, when it was last released, how frequently changes are introduced, and whether issues/bug reports are responded to.

### You MUST consider the benefits of each dependency

Each additional dependency you introduce makes you increasingly reliant upon other contributors. This introduces additional risks, such as migration effort required if the code no longer being maintained in the future or the possibility of malicious code being introduced. When introducing a dependency, you should consider whether the functionality you gain sufficiently offsets any risks.

### You MUST be able to produce a list of all dependencies

Knowing what dependencies your software has is essential to being able to ensure they are kept up-to-date and known vulnerable versions are avoided. This can be achieved by producing a "software bill of materials" -- a document that describes all of the component parts that were used to create a given version of your software.

### You MUST keep dependencies up to date

Dependencies should be updated frequently to ensure that you receive bug fixes, security updates and new features quickly. By applying updates often, even if they don't directly provide value, you reduce the time taken to respond to more critical updates as there will be fewer changes required.

### You MUST monitor your dependencies for vulnerabilities

There are many security scanning tools that can identify when your dependencies have known vulnerabilities -- often referring to databases of Common Vulnerabilities and Exposures (CVEs), which describe problems that have been identified in particular software dependencies. These can help you understand when one of your dependencies has a known problem.

### You MUST consider the impact of vulnerabilities in your dependencies

Security scanning tools do not consider the context of how you have made use of a dependency. When you become aware of a vulnerability in one of your dependencies, you must investigate to understand how the vulnerability may affect your software.

If it affects parts of the dependency that you do not use or there are other mitigations already in place, you may be able to defer updating the dependency until your next regular update, following a "business as usual" approach.

If your software is affected by the vulnerability, you will likely need to take action more urgently. In the most serious case, this may include temporarily making your software unavailable to users whilst the update is applied, to avoid the risk of your software being exploited.

### You MUST prevent known vulnerable dependencies being used

Through tooling, you can ensure that software with dependencies with known exploitable vulnerabilities cannot be built or deployed. This can reduce the risk of old, vulnerable versions of dependencies being used by mistake, and incentivise people to update their dependencies frequently.

### You MUST test your software appropriately after updating a dependency

When you update a dependency, you should be confident that it has not introduced an unexpected change in behaviour and that it works alongside other dependencies as expected. This would usually be most easily achieved through appropriate automated tests that verify the software functions correctly.

### You MUST store all software artefacts in a suitable repository

All dependencies should be versioned using an appropriate repository and dependency management tooling. You should never need to manually download or copy dependency code into your application, as this is prone to human error, security risks, and unexpected changes in behaviour.

### You MUST fetch the software artefacts for your dependencies from a trustworthy source

When you add a dependency to your application, you must consider where the built software artefacts for that dependency will be fetched from. This must be a form a repository where a given version of the artefact is immutably stored and specific versions can be retrieved.
