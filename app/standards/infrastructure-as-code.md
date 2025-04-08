---
layout: page
title: Infrastructure as code
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Infrastructure-as-code (IaC) is an approach used to describe how cloud resources should be provisioned and configured in a way that is automated, consistent, and versioned.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST define cloud infrastructure using IaC tooling](#you-must-define-cloud-infrastructure-using-iac-tooling)
- [You MUST store IaC in version control](#you-must-store-iac-in-version-control)
- [You MUST apply infrastructure changes through automated pipelines](#you-must-apply-infrastructure-changes-through-automated-pipelines)
- [You MUST avoid making infrastructure changes outside of IaC](#you-must-avoid-making-infrastructure-changes-outside-of-iac)
- [You MUST make use of IaC testing and validation tools](#you-must-make-use-of-iac-testing-and-validation-tools)
- [You MUST follow security best practices for your cloud platform](#you-must-follow-security-best-practices-for-your-cloud-platform)

### You MUST define cloud infrastructure using IaC tooling

Using IaC to describe how cloud resources should be provisioned allows you to automatically build software systems out of different cloud services. This avoids the need to manual and error prone manual configuration, which may be hard to understand, maintain, and reproduce. 

### You MUST store IaC in version control

Using version control brings similar benefits to infrastructure as it does general software development, such as:
- Acting as a single source of truth about how infrastructure is configured.
- Enabling multiple engineers to contribute to an overall system simultaneously.
- Providing a record of what changes have been made, when, and by whom.
- Enforcing a level of access control to who can make changes.

### You MUST apply infrastructure changes through automated pipelines

Applying changes to infrastructure through pipelines reduces the risk of human error, allows automated checks to be performed, and can enforce consistent provisioning across different environments.

### You MUST avoid making infrastructure changes outside of IaC

Changes made to infrastructure outside of IaC can be difficult to understand, track, and reproduce. They may also be unpredictably overridden by subsequent IaC deployments and could cause rollback processes to fail.

### You MUST make use of IaC testing and validation tools

As IaC is a form of executable specification, it is prone to the same types of human errors as any other sort of code. It should therefore be subject to appropriate testing, to prevent misconfiguration or unexpected results, before it is deployed.

### You MUST follow security best practices for your cloud platform

You must ensure that you secure your cloud infrastructure appropriately. For example, employing role-based access control (RBAC) and following the "principle of least privilege" reduces the likelihood and impact of security breaches by ensuring that tools, users and infrastructure are given the minimum permissions required to perform their tasks. Access to additional permissions should only be granted to users for the minimum time necessary to complete a required task, and the granting of these permissions should be audited.
