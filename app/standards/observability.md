---
title: Observability
date: 2025-03-21
id: 1
---

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
To operate software effectively, you need to have insights into how it is behaving and performing by capturing logs and metrics about significant events. This allows you to detect, diagnose, and resolve issues quickly, or even prevent there being a user impact.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST capture meaningful log data](#you-must-capture-meaningful-log-data)
- [You MUST have a way to inspect and search log data](#you-must-have-a-way-to-inspect-and-search-log-data)
- [You MUST have a way to automatically alert or take action from log data](#you-must-have-a-way-to-automatically-alert-or-take-action-from-log-data)
- [You MUST capture data at platform and technology appropriate levels](#you-must-capture-data-at-platform-and-technology-appropriate-levels)
- [You MUST define a useful lifetime for log data](#you-must-define-a-useful-lifetime-for-log-data)
- [You MUST have appropriate access controls](#you-must-have-appropriate-access-controls)

### You MUST capture meaningful log data

Having appropriate log data is essential to understanding how your software is behaving. However, you should not log data excessively as this increases the costs of storage and indexing, makes it harder to find relevant logs, and increases the risk of personally identifiable information (PII) being exposed unknowingly.

### You MUST have a way to inspect and search log data

Using appropriate log management and analytics tooling allows you to more quickly find relevant information and resolve issues more quickly. The capability to build customised visualisations or dashboards allows you to tailor this specifically to logs of interest.

### You MUST have a way to automatically alert or take action from log data

Manual monitoring of logs, visualisations, or dashboards is time-consuming, difficult, and error-prone. Automated alerting tools allow you to specify conditions under which action is required to protect service availability, which should be configurable based on a specific application's requirements.

Alerts should always be actionable. Spurious alerts make it less likely real alerts will be given appropriate attention, increasing the probability and severity of user-impacting incidents.

### You MUST capture data at platform and technology appropriate levels

Depending on the technology you use, you need to consider what information is relevant to log and monitor. For example, you may need to log:
- User interaction with a frontend component
- Database health indicators
- API and network logs
- Container, virtual machine, or hardware utilisation metrics
- Business level management information

### You MUST define a useful lifetime for log data

Retaining logs for longer than they are useful wastes storage and compute resources. It makes it harder to identify relevant information and also potentially increases the risk of any data breaches.

### You MUST have appropriate access controls

Depending on the sensitivity of the data you are logging, you must identify who should have access to the data and implement appropriate access control. This should be discussed in collaboration with your Security Information Business Partner (SIBP).
