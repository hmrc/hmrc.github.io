---
layout: page
title: Test automation
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Automating tests helps increase the accuracy and reproducibility of tests, reduces test execution effort, and enables continuous integration/deployment practices that allow value to be released to users more frequently with confidence.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST identify appropriate levels of testing to automate](#you-must-identify-appropriate-levels-of-testing-to-automate)
- [You MUST consider whether automation is appropriate](#you-must-consider-whether-automation-is-appropriate)
- [You MUST reduce duplication between different levels of testing](#you-must-identify-appropriate-levels-of-testing-to-automate)
- [You MUST run automated tests regularly](#you-must-run-automated-tests-regularly)
- [You MUST manage the size of test packs over time](#you-must-manage-the-size-of-test-packs-over-time)
- [You MUST maintain test packs to reduce flaky tests](#you-must-maintain-test-packs-to-reduce-flaky-tests)

### You MUST identify appropriate levels of testing to automate

Depending on the software under test, you will be able to gain confidence from automating a range of tests, such as:
- Unit tests
- Integration tests
- User interface driven tests
- Performance tests
- Accessibility tests
- Security tests

### You MUST consider whether automation is appropriate

The code and configuration of automated tests must be created and then maintained over time, like with application code. It is therefore important to consider the costs and benefits of automating different tests, and how many of those tests, rather than automating all tests.

### You MUST reduce duplication between different levels of testing

Different levels of testing have vastly different execution costs. Therefore, if it is possible to gain confidence that functionality is correct using faster running unit tests this should be preferred over integration or user interface driven tests. Testing the same functionality at multiple levels gives quickly diminishing returns so should be avoided.

This can be facilitated by having development and test professionals pairing or working closely together, so they can collectively decide the best test approach for a given change.

### You MUST run automated tests regularly

Tests provide the most value when they are run often enough to detect new defects and potential regressions. They should ideally be run for every change that is made to make it easy to identify which change has caused a failure to occur.

### You MUST manage the size of test packs over time

Very large sets of tests will take longer to run and therefore provide less immediate feedback. If tests impact upon release cadence too greatly, people will opt to not run them or ignore the results.

### You MUST maintain test packs to reduce flaky tests

Flaky tests are tests that sometimes fail even though there have been no relevant changes to the code base. It is important to investigate these tests and mitigate the causes of the flakiness, or people will lose confidence in the test pack. It also increases the likelihood that genuine defects or regressions are ignored, as the failure may be incorrectly attributed to flakiness.
