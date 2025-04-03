---
layout: page
title: Cookies
date: 2025-03-21
id: 1
related:
    sections:
        - title: Related links
          items:
            - text: Working with cookies and similar technologies - GOV.UK Service Manual
              href: https://www.gov.uk/service-manual/technology/working-with-cookies-and-similar-technologies
            - text: Cookies page - GOV.UK Design System
              href: https://design-system.service.gov.uk/patterns/cookies-page/
            - text: Cookies and similar technologies - Information Commissioner's Office
              href: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
---

{% from "govuk/components/inset-text/macro.njk" import govukInsetText %}

<p class="govuk-body-s">
Last updated: {{ date | postDate }}
</p>

<p class="govuk-body-l">
When setting cookies you should consider their purpose and specify attribute values that reduce security risks. External facing websites that make use of cookies to store data on a user's device must abide by the Privacy and Electronic Communications Regulations 2003.
</p>

<hr class="govuk-section-break--l govuk-section-break--visible">

## Requirement(s)
- [You MUST detail cookies in a cookie policy](#you-must-detail-cookies-in-a-cookie-policy)
- [You MUST determine what cookies are essential](#you-must-determine-what-cookies-are-essential)
- [You MUST gain consent from external users](#you-must-gain-consent-from-external-users)
- [You MUST use the <tt>HttpOnly</tt> attribute when possible](#you-must-use-the-httponly-attribute-when-possible)
- [You MUST use the <tt>Secure</tt> attribute](#you-must-use-the-secure-attribute)
- [You MUST scope cookies appropriately](#you-must-scope-cookies-appropriately)

### You MUST detail cookies in a cookie policy

Any cookies that may be created during an external user's interaction with a website must be detailed in a cookie policy. This must include the name of the cookies, what they are used for, and how long they will be stored.

### You MUST determine what cookies are essential

If a cookie is required to perform an action that an external user has requested, for example to track that they have successfully authenticated, then it is termed an essential cookie. These do not require consent from the user but must still be detailed in a cookie policy.

### You MUST gain consent from external users 

For external facing websites, you must gain consent from the user prior to storing any non-essential cookies. The <a href="https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/#consent">guidance from the ICO</a> specifies:

{{ govukInsetText({
  text: "To be valid, consent must be freely given, specific and informed. It must involve some form of unambiguous positive action – for example, ticking a box or clicking a link – and the person must fully understand that they are giving you consent."
}) }}

### You MUST use the <tt>HttpOnly</tt> attribute when possible

When setting cookies, the <tt>HttpOnly</tt> attribute can help reduce the risk of cross-site scripting (XSS) attacks by preventing Javascript code from being able to access its content. This form of attack is common and has persistently featured in the <a href="https://owasp.org/www-project-top-ten/">OWASP Top 10</a>, which monitors the most significant security risks to web applications.

### You MUST use the <tt>Secure</tt> attribute

When setting cookies, the <tt>Secure</tt> attribute specifies that the browser should only send the cookie back to requests using the HTTPS protocol. This makes it more difficult for unauthorised parties to observe the value of the cookie when it is sent from the user's device to the server.

### You MUST scope cookies appropriately

When setting cookies, the <tt>Domain</tt> and <tt>Path</tt> attributes describe the URLs to which the cookies should be sent. By specifying appropriate values for these attributes you can reduce the risk of cookies being sent unnecessarily to other websites on the same domain that do not need them.
