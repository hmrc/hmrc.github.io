---
layout: page
title: Build pipelines
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Build pipelines are a key part of modern software development. They should be used to transform source code and other inputs into deployable software in an automated, repeatable way.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST use build pipelines to produce deployable software artefacts](#you-must-use-build-pipelines-to-produce-deployable-software-artefacts)
- [You MUST produce versioned build artefacts](#you-must-produce-versioned-build-artefacts)
- [You MUST run appropriate tests and checks in build pipelines](#you-must-run-appropriate-tests-and-checks-in-build-pipelines)

### You MUST use build pipelines to produce deployable software artefacts

By automating the process of building software artefacts, you ensure this happens in a controlled, repeatable way and improve consistency. You also avoid the risk of hidden dependencies that are available on a developer's machine that may cause later builds to fail unexpectedly.

### You MUST produce versioned build artefacts

Artefacts that are produced by build pipelines should be uniquely versioned, in an immutable way. This means that once a specific version of an artefact has been created, no later build should overwrite this by reusing the same version number. These artefacts should then be stored in a repository.

### You MUST run appropriate tests and checks in build pipelines

By automating tests and checks in a pipeline at build time, you can ensure that deployable artefacts are only produced if these pass. These tests should include low-level unit tests, which are cheap to execute, as well as higher level tests where appropriate. Checks may include measures such as test coverage, code complexity metrics, and dependency scanning.
