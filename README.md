# [hmrc.github.io](http://hmrc.github.io/)

[![Join the chat at https://gitter.im/hmrc/hmrc.github.io](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/hmrc/hmrc.github.io?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Stories in Ready](https://badge.waffle.io/hmrc/hmrc.github.io.png?label=ready&title=Ready)](https://waffle.io/hmrc/hmrc.github.io)

Information about the HMRC GitHub organisation, repositories and approaches to software

## Getting Started

### Requirements

* [Ruby](https://www.ruby-lang.org/) 
	* `> 2.0.0`
* [Bundler](http://bundler.io/) 
	* `gem install bundler`

### Running locally

* Clone this repo
* Run `bundle install`
* Run `bundle exec jekyll serve`
* Open a browser at [http://localhost:4000](http://localhost:4000)

## Making changes

* Create/edit `.md` files in the `/pages/` folder
* Directory structure gets turned into urls
	* i.e. `/pages/foo/bar/index.md` becomes `localhost:4000/pages/foo/bar`
* Take a look at [how the styling works](https://hmrc.github.io/pages/how-the-styling-works.html) to get an idea of how to style your page.
* Make sure to include a title, set the layout to **page**, and set the category to one that exists in the category-list in _config.yml, at the top of each page like so:
```
---
title: Adding a new Scala library to GitHub
layout: page
category: Development Documentation
---
```

