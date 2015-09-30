---
---

## Creating a New Repository
The proces of creating a new repository is automated and peformed through a job in Jenkins which uses [init-repository](https://github.com/hmrc/init-repository).

init-repository current performs the following tasks:

- Creates new a [github.com/hmrc](https://github.com/hmrc) repositiory and gives write access to a given team
- Creates bintray packages

###Steps
1. Got to the 'create-a-release' job in Jenkins Open
2. Enter the name of your new repository and the team to which it will belong. The team must be the exact text that apepars on [the teams page](https://github.com/orgs/hmrc/teams)
3. Run the job

#####TODO
- Add inital boostrap tag requred for [sbt-git-versioning](https://github.com/hmrc/sbt-git-versioning)
- Create README.MD with links to Bintray artifact details
- Create Travis jobs
- Add link README.MD to Travis job
