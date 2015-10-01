---
---

## Creating a New Repository
The process of creating a new repository is automated and peformed through a job in Jenkins which uses [init-repository](https://github.com/hmrc/init-repository).

init-repository currently performs the following tasks:

- Creates a new [github.com/hmrc](https://github.com/hmrc) repositiory and gives write access to a given team
- Creates bintray packages

###Steps
1. Go to the 'create-a-release' job in Jenkins Open
2. Enter the name of your new repository and the team to which it will belong. The team must be the exact text that apepars on [the teams page](https://github.com/orgs/hmrc/teams)
3. Run the job

#####TODO
- Add inital bootstrap tag required for [sbt-git-versioning](https://github.com/hmrc/sbt-git-versioning)
- Create README.MD with badge for Bintray artifact details
- Create Travis job
- Add Travis badge to README.MD
