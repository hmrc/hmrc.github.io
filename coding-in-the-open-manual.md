---
---

## Coding In The Open Manual

The digital services hosted on the MDTP are developed according to the [Government Digital Service (GDS)](https://gds.blog.gov.uk/about/) [Service Manual](https://www.gov.uk/service-manual) and [Digital Service Standards](https://www.gov.uk/service-manual/digital-by-default). In the GDS Digital Service Standards, Point 8 says:

> "Make all new source code open and reusable, and publish it under appropriate licences (or provide a convincing explanation as to why this cannot be done for specific subsets of the source code)"

At HMRC, we are making all new source code open and reusable at [HMRC on GitHub](https://www.github.com/hmrc) and publishing it under the [Apache 2 License](https://www.apache.org/licenses/LICENSE-2.0). We are also providing a view of our continuous build system at [HMRC on Travis](https://travis-ci.org/hmrc/), and publishing our artifacts at [HMRC on Bintray](https://www.bintray.com/hmrc)

Security-critical configuration and/or code may remain within internal HMRC systems, but the vast majority of MDTP digital services are either open-sourced or in the process of being open-sourced. 

At HMRC, we want to be transparent about what we are spending money on. Our manifesto is:

> "The MDTP has been paid for by the UK public so they should have it available to them if they want"

Hopefully the repositories that we produce are of use to other Open Source projects, but at worst they will provide real world examples of using the [Play Framework](https://playframework.com/), interacting with [MongoDB](https://www.mongodb.org/) using [ReactiveMongo](http://reactivemongo.org/), etc.

Of course if you think there is a better way of doing something then submit a pull request or raise an issue - but don't send a letter, we are [Digital By Default](https://www.gov.uk/service-manual/start) after all!

### Source Code In The Open

HMRC is a [GitHub.com public organisation](https://www.github.com/hmrc). The expectation is that every source code repository - a library, a frontend, a service - will be open-sourced on GitHub.com. When a repository contains security-critical code and/or configuration it is refactored to be as small a component as possible, with the non-critical majority open-sourced as a separate repository.

The HMRC on GitHub organisation is composed of delivery teams currently working within HMRC on MDTP infrastructure and services. The ['Iron Man' improved permissions model](https://github.com/orgs/improved-permissions) is used so that new organisation membership is managed centrally and delivery team membership is devolved to delivery team leads. 

### Building For The Open

Our build approach aims to be fully aligned with the principles and practices of [Continuous Delivery](http://www.continuousdelivery.com) and as transparent as possible to the British taxpayer. In terms of day-to-day MDTP operations we have a number of aims:

- Team-wide build permissions - all MDTP developers and testers should be able to release artifacts 
- No snapshots - every commit should yield a releasable artifact
- No artifact rebuilds - creating a release should not necessitate a recompilation and retest of source code
- No local tags - GitHub tagging should be for documentation purposes and automatic

Our build approach should be described as Building *For* The Open not Building *In* The Open. A prior investigation identified a number of concerns surrounding Building *In* In The Open:

- A public cloud-based build system would likely be slower than a self-hosted solution as CPU/IO performance will be constrained - this is deemed a migration concern
- A public cloud-based build system would need our access key for publishing artifacts to a cloud-based artifact repository - this is deemed an unacceptable security risk
- A public cloud-based build system would download third party dependencies from the Internet without a virus scan - this is deemed an unacceptable security risk

We still want to provide build transparency to the British taxpayer, and for that reason we have the concept of a Continuous View via [HMRC on Travis](http://www.travis-ci.org/hmrc) and an internal Continuous Build via [Jenkins Jobs](https://www.github.com/hmrc/jenkins-jobs). Each library, frontend, and service will have a public Travis job for compilation and testing, and an internal Jenkins job for compiling, testing, packaging, and publishing changes. 

The following diagram is a logical representation of our Building For The Open architecture.

![Building For The Open](/images/building-for-the-open.png)

#### Release Candidates

These are uniquely versioned artifacts sourced from `master` via [GitHub Flow](https://guides.github.com/introduction/flow/index.html), and intended for development usage. Release candidate versioning is derived from [Semantic Versioning](http://www.semver.org/) and is as follows:

    <most recent Release>-<commits since most recent Release>-g<commit hash>

For Release Candidates that are built from the same commit as a Release the version will be:

    <most recent Release>-0-g0000000

An implementation of this strategy must adopt the following rules:

1. Call `git describe`
1. If the result is not a tag with a `v` prefix then fail
1. If the result is a tag with no commits append `-0-g0000000` e.g. `v1.1.0` -> `v1.1.0-0-g00000000`
1. Strip the `v` prefix

The following repositories are technology-specific implementations of the HMRC versioning strategy:

- sbt: [sbt-git-versioning](https://github.com/hmrc/sbt-git-versioning) and [sbt-git-stamp](https://github.com/hmrc/sbt-git-stamp)

#### Releases

These are uniquely versioned artifacts sourced from a Release Candidate via [Releaser](https://www.github.com/hmrc/releaser) and intended for production usage. The versioning scheme is:

    <major version>.<minor version>.<hotfix version>

Releaser transforms Release Candidates into Releases on the fly, and automatically tags the GitHub repository upon success `jenkins - 1.0.0 tagged from #abcd by alice on 23 Mar 15`. 

#### Example

Consider Alice working on [domain](https://github.com/hmrc/domain). The most recent Release to production was `1.1.0` and she wants to release commits `#abcdefg`, `#bbcdefg`, `#bbcdefh`, `#bbcdefi`, `#cbcdefg`, and `#dbcdefg` yielding a minor version, a minor version, a major version, and a hotfix version.

1. `#abcdefg` -> `1.2.0`
    1. Alice starts development on master from `1.1.0` (Release Candidate `1.1.0-0-g0000000`)
    2. Alice tests and commits `#abcdefg` and pushes to master
    3. `#abcdefg` is the first commit since Release `1.1.0`. so Release Candidate `1.1.0-1-gabcdefg` is created
    4. Alice releases Release Candidate `1.1.0-1-gabcdefg` as a minor version via [Releaser](https://www.github.com/hmrc/releaser), which creates Release `1.2.0`
1. `#bbcdefg` -> `1.3.0`
    1. Alice starts development on master from `1.2.0` (Release Candidate `1.2.0-0-g0000000`)
    2. Alice tests and commits `#bbcdefg`, `#bbcdefh`, `#bbcdefi`, and pushes to master
    3. There have been 3 commits since Release `1.2.0`, so Release Candidate `1.2.0-3-gbbcdefi` is created
    4. Alice releases Release Candidate `1.2.0-3-gbbcdefi` as a minor version via [Releaser](https://www.github.com/hmrc/releaser), which creates Release `1.3.0`
1. `#cbcdefg` -> `2.0.0`
    1. Alice starts development on master from `1.3.0` (Release Candidate `1.3.0-0-g0000000`)
    2. Alice tests and commits `#cbcdefg` and pushes to master
    3. `#cbcdefg` is the first commit since Release `1.3.0`, so Release Candidate `1.3.0-1-gcbcdefg` is created
    4. Alice releases Release Candidate `1.3.0-1-gcbcdefg` as a major version via [Releaser](https://www.github.com/hmrc/releaser), which creates Release `2.0.0`
1. `#dbcdefg` -> `1.3.1`
    1. Alice creates a `1.3.0-hotfix` branch from `1.3.0` on master i.e. commit `#bbcdefi`
    2. Alice develops and tests a local Release Candidate `1.3.0-0-g0000000`
    3. Alice tests and commits `#dbcdefg` and pushes to branch `1.3.0-hotfix`
    4. `#cbcdefg` is the first commit since Release `1.3.0` on branch `1.3.0-hotfix`, so Release Candidate `1.3.0-1-gdbcdefg`
    5. Alice releases Release Candidate `1.3.0-1-gdbcdefg` as a hotfix version via [Releaser](https://www.github.com/hmrc/releaser), which creates Release `1.3.1`

There is an internal HMRC document called "Migrating To Building For The Open" that describes how to migrate an internal build to GitHub.com.

### Artifacts In The Open

All our Release Candidates and Releases are hosted at [HMRC on Bintray](https://www.bintray.com/hmrc). 

Once an artifact has been built on Jenkins, it is automatically published to Bintray. This is restricted to Jenkins to protect our Bintray and PGP keys. For SBT repositories our publishing plugin [sbt-bintray-publish](https://www.github.com/hmrc/sbt-bintray-publish) is automatically run on Jenkins as a global SBT auto plugin, which means you do not have configure any Bintray publishing code.

### Internal Documentation

This documentation is supplemented by the following internal HMRC documentation:

1. "Joining HMRC on GitHub" - describes how to apply to join HMRC on GitHub
1. "Migrating To Coding In The Open" - how to migrate the code, builds, and artifacts of a source code repository into the open
1. "Security In The Open" - how to mitigate a security fix in an open-source repository
