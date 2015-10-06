---
title: Service Catalogue
layout: page
---

{% if jekyll.environment == 'development' %}
   {% assign github = site.data.github %}
{% else %}
   {% assign github = site.github %}
{% endif %}

{% for repository in github.public_repositories %}
  [{{ repository.name }}]({{ repository.html_url }})
  : {{ repository.description }}
{% endfor %}
