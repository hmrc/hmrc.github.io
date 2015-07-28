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

There is an internal HMRC document called "Source Code In The Open" that describes how to migrate an internal source code repository to GitHub.com, and the procedure for fixing security issues in a GitHub.com repository.

### Building For The Open

TODO

### Artifacts In The Open

TODO
