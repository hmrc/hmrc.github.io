---
title: Adding a new Scala library to GitHub
layout: post
category: Development Documentation
---

After these steps you will have an SBT project in github.com that contains everything you need to build and release
using HMRC's coding-in-the-open systems.

Notes

+ These steps are only for libraries, that is code that may be used by other applications, not services.
+ Our internal jenkins system is currently closed to the public
+ This assumes you are not migrating an existing library to github.com

### 1. Create a Github Repository under the HMRC organisation

Ask a Platoform Operations team to do this for you. When complete check the repository exist under [https://github.com/hmrc](https://github.com/hmrc) and that you have permissions to use it.

### 2. Create skeleton SBT code locally

+ Checkout the [sbt-templates](https://github.com/hmrc/sbt-templates) repository and run `python scripts/bin/create_library.py <project_name>`
+ You will then have a skeleton project with some 'hello world' example code and a test you can run with `sbt test`.
+ There will also be one commit tagged with version v0.1.0. Push the code along with the tag.

### 3. Create Bintray repositories

This is doen automatically the first time you create a release. You will be able to find your artifact under [https://bintray.com/hmrc/releases](https://bintray.com/hmrc/releases)

### 4. Configure and Trigger the job in our internal jenkins

Ask a Platform the Platoform Operations team how you can do that. Then verify the build is green and a release has been published to Bintray
