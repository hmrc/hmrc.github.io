---
layout: page
title: Handling secrets
date: 2025-04-22
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
Secrets, such as usernames and API keys, must be handled appropriately to prevent serious events such as data loss or unauthorised access.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST not include secrets in source code](#you-must-not-include-secrets-in-source-code)
- [You MUST limit the scope of secrets](#you-must-limit-the-scope-of-secrets)
- [You MUST be able to rotate secret keys](#you-must-be-able-to-rotate-secret-keys)
- [You MUST secure secrets appropriately](#you-must-secure-secrets-appropriately)

### You MUST not include secrets in source code

By using tooling to provide software with secrets at deployment time, rather than hard-coding them in source code, you significantly reduce the scope for secrets to be accidentally disclosed because they are only exposed to the software itself rather than engineers.

This also allows you to change values of secrets more quickly, as you are not bound to creating a new release version of the software to change a secret -- you can change the secret and redeploy the same version of the software.

### You MUST limit the scope of secrets

The value of a secret must be limited in scope as much as is reasonable. For example, secrets should not be shared across different deployment environments and should only provide access to the limited set of specific resources needed for a given service. This reduces the impact of secret disclosures by reducing what an unauthorised party can use the secret for.

If a secret needs to be revoked and rotated, having granular secrets that are per-environment and per-service can greatly minimise the time needed to restore the service and reduces the impact on other services.

### You MUST be able to rotate secret keys

You need to be able to rotate secrets -- either as part of a periodic process or in response to a known or suspected disclosure. The process for this should be well-documented and understood by all required parties. Where possible, you should automate this process to reduce the need for engineers to handle secret values.

### You MUST secure secrets appropriately

Secret values should be appropriately protected. For example, you may use a secret management tool that restricts access to secret values through role-based access controls, and only provide access to the relevant software itself.

You may also encrypt secrets using a suitable encryption algorithm, however this means you must then consider how and when to rotate the encryption key, and how to store that key securely.
