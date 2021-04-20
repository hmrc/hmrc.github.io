---
title: Coding in the open
layout: post
category: Development Documentation
---

The digital services hosted on the MDTP are developed according to the [Government Digital Service (GDS)](https://gds.blog.gov.uk/about/) [Service Manual](https://www.gov.uk/service-manual) and [Digital Service Standards](https://www.gov.uk/service-manual/digital-by-default). In the GDS Digital Service Standards, Point 8 says:

> "Make all new source code open and reusable, and publish it under appropriate licences (or provide a convincing explanation as to why this cannot be done for specific subsets of the source code)"

At HMRC, we are making all new source code open and reusable at [HMRC on GitHub](https://www.github.com/hmrc) and publishing it under the [Apache 2 License](https://www.apache.org/licenses/LICENSE-2.0). We are also publishing our libraries to our own public facing Artefact store [HMRC Open Artefacts](https://open.artefacts.tax.service.gov.uk/)

Security-critical configuration and/or code may remain within internal HMRC systems, but the vast majority of MDTP digital services are either open-sourced or in the process of being open-sourced. 

At HMRC, we want to be transparent about what we are spending money on. Our manifesto is:

> "The MDTP has been paid for by the UK public so they should have it available to them if they want"

Hopefully the repositories that we produce are of use to other Open Source projects, but at worst they will provide real world examples of using the [Play Framework](https://playframework.com/), interacting with [MongoDB](https://www.mongodb.org/) using [ReactiveMongo](http://reactivemongo.org/), etc.

> Of course if you think there is a better way of doing something then submit a pull request or raise an issue - but don't send a letter, we are [Digital By Default](https://www.gov.uk/service-manual/start) after all!

### Source Code In The Open

HMRC is a [GitHub.com public organisation](https://www.github.com/hmrc). The expectation is that every source code repository - a library, a frontend, a service - will be open-sourced on GitHub.com. When a repository contains security-critical code and/or configuration it is refactored to be as small a component as possible, with the non-critical majority open-sourced as a separate repository.

The HMRC on GitHub organisation is composed of delivery teams currently working within HMRC on MDTP infrastructure and services. The [improved permissions model](https://github.com/orgs/improved-permissions) is used so that the organisation is managed centrally,  delivery teams are managed by delivery team leads, and repositories are managed by delivery team members.


#### Supplementary Documentation

The following internal HMRC documentation is supplementary:

1. "HMRC on GitHub" - describes how to join HMRC on GitHub
1. "Migrating To Coding In The Open" - how to migrate the code, builds, and artifacts of a source code repository into the open
1. "Security In The Open" - how to mitigate security issues

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

We use an internal Jenkins job for compiling, testing, packaging, and publishing changes. 

#### Release Candidates

These are artifacts intended for development usage. Release candidate versioning is derived from [Semantic Versioning](http://www.semver.org/) and is as follows:

    <latest-major>.<latest-minor +1>.0-SNAPSHOT

The following repositories are technology-specific implementations of the HMRC versioning strategy:

- sbt: [sbt-git-versioning](https://github.com/hmrc/sbt-git-versioning), [sbt-git-stamp](https://github.com/hmrc/sbt-git-stamp) and [release-versioning](https://github.com/hmrc/release-versioning)

An increment of the major version is controlled in the build.sbt file and read by sbt-git-versioning. If the majorVersion is increased, the version will be

    <next-major>.0.0-SNAPSHOT

#### Releases

These are uniquely versioned artifacts sourced from a Release Candidate via [Releaser](https://www.github.com/hmrc/releaser) and intended for production usage. The versioning scheme is:

    <major version>.<minor version>.<hotfix version>

Our internal jenkins job automatically tags the GitHub repository upon success `jenkins - 1.0.0 tagged by alice on 23 Mar 15`. 

#### Example

Consider Alice working on [domain](https://github.com/hmrc/domain). The most recent Release to production was `1.1.0` and she wants to release commits `#abcdefg`, `#bbcdefg`, `#bbcdefh`, `#bbcdefi`, `#cbcdefg`, and `#dbcdefg` yielding a minor version, a minor version, a major version, and a hotfix version.

1. `#abcdefg` -> `1.2.0`
    1. Alice starts development on master from `1.1.0` (Release Candidate `1.2.0-SNAPSHOT`)
    2. Alice tests and commits `#abcdefg` and pushes to master
    3. The internal build job compiles, tests and releases a minor version: `1.2.0`
1. `#bbcdefg` -> `1.3.0`
    1. Alice starts development on master from `1.2.0` (Release Candidate `1.3.0-SNAPSHOT`)
    2. Alice tests and commits `#bbcdefg`, `#bbcdefh`, `#bbcdefi`, and pushes to master
    4. The internal build job compiles, tests and releases a minor version: `1.3.0`
1. `#cbcdefg` -> `2.0.0`
    1. Alice increases the majorVersion property in build.sbt. From `1` to `2`
    2. Alice starts development on master from `1.3.0` (Release Candidate `2.0.0-SNAPSHOT`)
    3. Alice tests and commits `#cbcdefg` and pushes to master
    4. The internal build job compiles, tests and releases a major version:  `2.0.0`
1. `#dbcdefg` -> `1.3.1`
    1. Alice creates a `1.3.0-hotfix` branch from `1.3.0` on master i.e. commit `#bbcdefi`
    2. Alice develops and tests a local Release Candidate `1.3.1-SNAPSHOT`
    3. Alice tests and commits `#dbcdefg` and pushes to branch `1.3.0-hotfix`
    5. The internal build job understands a hotfix has to be creaated beacuse it is building from a branch intead of master. It compiles, tests and releases a patch version: `1.3.1`

There is an internal HMRC document called "Migrating To Building For The Open" that describes how to migrate an internal build to GitHub.com.

### Artifacts In The Open

All Releases of libraries are hosted at [HMRC Open Artefacts](https://open.artefacts.tax.service.gov.uk/) in order to be used by the public if desired.
The archives containing the packaged microservices are not published, as their only purpose is to be deployed on the HMRC environments
