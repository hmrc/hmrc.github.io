---
title: Adding a new Scala library to GitHub
layout: page
---

After these steps you will have an SBT project in github.com that contains everything you need to build and release
using HMRC's coding-in-the-open systems.

Notes

+ These steps are only for libraries, that is code that may be used by other applications, not services.
+ ci-open is currently closed to the public
+ This assumes you are not migrating an existing library to github.com

### 1. Create a Github Repository under the HMRC organisation

Ask a Platform Lead to do this for you. When complete check the repository exist under [https://github.com/hmrc](https://github.com/hmrc) and that you have permissions to use it.

### 2. Create skeleton SBT code locally

+ Checkout the [sbt-templates](https://github.com/hmrc/sbt-templates) repository and run `python scripts/bin/create_library.py <project_name>`
+ You will then have a skeleton project with some 'hello world' example code and a test you can run with `sbt test`.
+ There will also be one commit tagged with version v0.1.0. Push the code along with the tag.

### 3. Create Bintray repositories

Ask a Platform Lead to do this for you. When complete check the packages exist under [https://bintray.com/hmrc/releases](https://bintray.com/hmrc/releases) and [https://bintray.com/hmrc/release-candidates](https://bintray.com/hmrc/release-candidates)

### 4. Create a build in ci-open

Builds on ci-open are automatically generated.

+ Checkout the [jenkins-jobs](https://github.com/hmrc/jenkins-jobs/) repository
+ Add a build description to the relevant product jobs file e.g. [mdtp.groovy](https://github.com/hmrc/jenkins-jobs/blob/master/jobs/mdtp.groovy) for an MDTP-wide library:

```new SbtLibraryJobBuilder('project_name').
                         build(this as DslFactory)
```

+ Push or submit a pull request for this change.
+ Re-seed ci-open Jenkins using the `Seed Jenkins` job

### 5. Create a build in Travis

Ask a Platform Lead to do this for you.

### 6. Trigger the job in ci-open

Verify the build is green and a release-candidate has been published to Bintray under https://bintray.com/hmrc/release-candidates/<project_name>

### 7. Release the release candidate

+ running the create-a-release job in ci-open
+ pass in the name of your project, the release-candidate number and the type of release you want then click build
+ verify a release has been published to Bintray under https://bintray.com/hmrc/releases/<project_name>
