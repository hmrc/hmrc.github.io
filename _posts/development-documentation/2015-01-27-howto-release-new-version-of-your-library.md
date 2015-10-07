---
title: Making a release from github.com/hmrc
layout: post
category: Development Documentation
---

1. Ensure all the changes you need for your release have been merged to master. HMRC coding in the open projects do not use git/github flow or any continuous integration strategy in order to keep things nice and simple.
2. There's no need to tag your release, the jenkins server at ci-open will pick up your changes and publish a *release candidate* to bintray
  * Jenkins will do it's best to give your release candidate a version number... make a note of this as we'll need it in the next step. Please note, this will be based off the **PREVIOUS** release version number and **DOES NOT** reflect the version number of your impending release.

  ![Relase candidate version number](/images/howto-create-release/release-candidate.png)<br><br>
3. Head over to the **'create a release'** jenkins job, and click on 'build with parameters'. Enter the name repository name for your project, along with the release candidate version number that you want to cut the release from. Finally, the create-a-release job will increment the version number for you automatically... you just need to tell it how to do so by selecting either MINOR, MAJOR or PATCH from the dropdown.

  ![Create a release parameters example](/images/howto-create-release/create-a-release.png)<br><br>
4. Click build, and then if all goes well your new version should now be available to the world. Jenkins will also tag your repository for you with some useful information about the release.
  ![Latest release](/images/howto-create-release/latest-release.png)<br>
