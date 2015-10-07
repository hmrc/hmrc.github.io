---
title: How the styling works
layout: post
category: Development Documentation
---

Given that we are using [github pages](https://pages.github.com) to publish this blog each post is generated from [markdown](https://pages.github.com). That gives us limited scope for altering the style of each page as we won't in general be adding in html to style particular elements.

As a result it's useful to know what rules are in place to apply the style you see here to common elements that are generated through markdown. So this is a demonstration of how it works.

You can also look at the [stylesheets](https://github.com/hmrc/hmrc.github.io/tree/master/stylesheets).

# This is a site heading.

You get it by using a single '`#`' in front of your heading text in your markdown.

## This is a page subheading.

To generate one of these use two hashes '`##`' in front of your heading text. We don't really have page headings/titles. It's good practice to make the first page subheading the title of the page.

### You can add another layer of subheadings

Using three or more hashes ('`###`', '`####`', etc) will give the same heading style.

A markdown unordered list (using '`*`'s) will look like this:

* This is the first item
* This is the second item

We have also added styling for quotations (use a '`>`' to start a quotation. 

> "It looks like this as quotations are meant to stand out."

Everything else on this page is a paragraph which is the default tag that is given to free form text in markdown.

The font used in the headings is [Oswald](https://www.google.com/fonts/specimen/Oswald).
