---
title: Making a release from github.com/hmrc
layout: post
category: Development Documentation
---

1. Ensure all the changes you need for your release have been merged to master. HMRC coding in the open projects do not use git/github flow or any continuous integration strategy in order to keep things nice and simple.
2. The internal jenkins server will pick up your changes automatically and publish a *release* to bintray. There's no need to tag your release.
3. Jenkins will also tag your repository for you with some useful information about the release.
  ![Latest release](/images/howto-create-release/latest-release.png)<br>

The above steps are identical for releasing a microservice or a frontend.
