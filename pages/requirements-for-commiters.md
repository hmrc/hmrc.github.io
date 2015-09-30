---
---

## Requirements For Commiters

> This document is a work-in-progress that is being updated as we put more code in the open.

### Principles for serivces in the open

1. Anyone should be able to clone service code in github and run that service locally in-order to develop on it. All tests should pass and it should use fake/mock dependent services for integration tests.
2. Open services should contain the absolute minimum amount of configuration to achieve principle 1. Extra configuration needed for the service to run on the platform with other services will be private.

### Working with sensitive strings such as passwords, internal URLs and API keys

The general principle is that code should be written in such a way that percludes sensitive strings being added to the code for any reason in the first place. 

- Services will have sensitive strings injected upon deployment; it is not ncecessary for the code repository to contain any senstive stirngs
- Scripts and stand-alone apps obtain sensitive strings by reading them from a file *outside* of the project. The typical convention for this is to add a hidden 'dot' directory in the users' home directory and a file(s) inside that contains the credentials. [An example of this in our releaser app](https://github.com/hmrc/releaser/blob/2cb97a5832d7a9e7d744c5397d358f4ada549d1f/src/main/scala/uk/gov/hmrc/releaser/Releaser.scala#L93-L97)




