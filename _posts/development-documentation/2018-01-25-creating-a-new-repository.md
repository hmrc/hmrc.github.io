---
title: Creating a new repository
layout: post
category: Development Documentation
---

## Creating a New Repository
The process of creating a new repository is automated and peformed through a job in Jenkins Open which uses [init-repository](https://github.com/hmrc/init-repository).

init-repository currently performs the following tasks:

- Creates a new [github.com/hmrc](https://github.com/hmrc) repositiory and gives write access to a given team
- Creates bintray packages

### Steps
1. Go to the 'create-a-repository' job in Jenkins Open
2. Click on "Build with Parameters" link
2. Enter the name of your new repository and the team to which it will belong. The team must be the exact text that appears on [the teams page](https://github.com/orgs/hmrc/teams) (login required)
3. Run the job

### Result
- A git tag of version v0.1.0
- [https://bintray.com/hmrc/](Bintray.com) releases and release-candidates packages 
- .gitignore
- .travis.yml
- README.md containing badges for Bintray and Travis

### Next Steps
- Your job should be automatically enabled on Travis. If not, please contact Platform Operations for assistance
- Add a Jenkins Open job for your new repository in [https://github.com/hmrc/jenkins-jobs](https://github.com/hmrc/jenkins-jobs) and re-seed Jenkins Open
- Add some useful information about your new repository to the readme
- If your repository is a library add the following to the end of the README, updating <ARTEFACT-NAME> with the name of your artifact (NOTE: leave the text '[INSERT-VERSION]' in the README, the actual version will show on the Bintray badge):

      resolvers += Resolver.bintrayRepo("hmrc", "releases")
      libraryDependencies += "uk.gov.hmrc" %% "<ARTEFACT-NAME>" % "[INSERT-VERSION]"
    
    
