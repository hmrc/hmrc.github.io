---
layout: post
title: Alpha assessment
category: The HMRC Tax Platform
---

This page should outline what the platform offers for those services who are entering their Alpha stage after Discovery. I would suggest reading this at the beginning of the Alpha stage but also it will have information that you will find useful before you go to your Alpha assessment.

### Infrastructure overview

The tax platform is currently hosted on a GCloud infrastructure provider. This allows us to create and scale infrastructure how and when we want to without the long lead times and expense normally associated with physical infrastructure. This infrastructure is built and supported by a central web-operations team in London. 

There are two main infrastructure areas to the tax platform, the Internet facing area where we host front-end applications which only deal with transient customer data. The second area is the PSN facing area which is a more secure area which talks to the HMRC head of duty systems and stores some customer data. The separation of these two areas allow us to keep our customers data secure as well as talking to customers over the Internet. These two areas are joined by a secure accredited bridge. 


### Testing and development 

At this stage the tax platform gives you a number of environments to play with, each offering different benefits.

* A [development environment][development environment] 
	* This will allow your developers to push their working code to an environment representative of the real world. The Development environment will contain up to date micro services from other teams, test instances of the Aspire head of duty systems, as well as government gateway and IDA. 
	* You can deploy to this environment whenever you like.   


* A [QA environmentt][QA environment] 
	* This is where your developers can push code ready for functional testing by your QA. This also has test instances of IDA, government gateway and the aspire back-end head of duty systems. You must test successfully here to progress to production. 
	* You can deploy to this environment whenever you like.   


* A [staging environment][staging environment]
	* The staging environment is where we performance test services. Although though it's not essential to performance test before a small private Beta we will demand that you at least have deployed to staging. Be prepared to work with the web-ops team in the week moving up to your first production release. 
	* You need web-ops to help you deploy to staging on your first deployment but after that you can deploy and test here whenever you like.   

### Continuous deployment
* [Production deployments][step by step guide]
	* This is the customer facing tax platform! At this stage this environment can be used to run a small private beta. There are a number of prerequisites before you are allowed to go into this environment. It's worth reading the [step by step guide to production releases][step by step guide] now. Once you have met all these prerequisites you can deploy to production. 
	* For your initial deployment it's best to raise a PRODREL ticket in Jira as a placeholder as soon as possible (you can't be too early!). After this initial deployment you can use the [release form][release form] which will allow you to release with 48 hours notice.
	* Don't forget that you will have to go through a [performance readiness revieww][PRR].

### Security
While it will be your responsibility as a team to get your service accredited through the standard RMAD process the tax platform is regularly penetration tested and its accreditation updated. This means if you only have to worry about your application and not about the infrastructure that your service runs on. There are number of proactive security measures we take as a platform team to ensure the protection of our customers.

* The platform infrastructure is penetration tested every 6 months or upon any architectural change outside the scope of the existing RMADS
* The platform RMADS are updated every 6 months or upon any functional change which would affect security 
* Akamai is in place to provide DDOS protection.

### Monitoring

The tax platform provides a number of tools and mechanisms that your service can use to monitor your service. These tools range from monitoring performance or customer satisfaction to login internal audit events for fraud prevention. Some of these services are free to use if you wish, others we insist on in order to enable us support your service in live. 

* Analytics
	* Google analytics is our primary analytics tools and will tell you much about customer behavior on your service. 
	* Deskpro, if used to support your pages, will show you which pages are generating the most support tickets, the nature of these tickets and how quickly they are being resolved.
* *Incident Monitoring*
	* Kibana is used to log application audit events and we reply on the team to define what is important.  
	* Sensu alerts can then be set up from the Kibana logs to alert the service team and the web-ops team when services are behaving abnormally. 
	* Pagerduty is used to alert the out of hours support team (2 members of web-ops) if anything unusual is happening outside of office hours.
* Transaction monitoring
	* Splunk is used to record and interrogate specific business events. It is stored in a more secure area of the tax platform (PSN facing) so that this data can contain information specific to customers. This can be used by enforcement and compliance and other business areas to understand customer behavior. 

Web-ops use these same tools to monitor the platform infrastructure as your team use to monitor your service. 

### Incident support

Once you have deployed onto the tax platform and you have your monitoring set up your service will be supported both in and out of hours by the web-operations team. We supply a dedicated engineer and on-call service manager 24/7/365 who will respond to any monitoring alerts of escalation from customer support. 

During office hours your team will always be informed and consulted on decisions regarding the production service and we will always endeavour to keep your service running. Out hours we may need to take your service down if it risks any of the other platform services but will work with you to get it fixed and back up and running the next day. We communicate these production service decisions through JIRA tickets but also announcements by the [live service announcements email][announcements].

### Customer support

The tax platform also comes with its own customer support service. This is built using a tool called Deskpro. It allows customers to submit support requests as well as feedback. These tickets are then responded to by a tax platform customer support team and supporting expert tax teams. The responses are delivered by email. 

The tools team in London look after this service and can assist you in understanding how to get the most out of the support model. 

### Disaster recovery

There are different levels of resilience built into the tax platform which provide resilience against disaster and fairly rapid disaster recovery. These levels are outlined below:

* Data-centre level
	* The tax platform's Internet facing (il2) infrastructure is currently run in an active/passive arrangement across two data-centres. This means that if we were to lose one data-centre we could fail over to our second data centre. Customers would be affected by this fail over but we would be operational again within 30 minutes. 
	* The tax platform's PSN facing (il3) infrastructure is configured in active/active arrangement across two data-centres. This means that if a data-centre went down that micro-services in this area would continue to run without any impact to customers.
* Application server level 
	* Multiple instances of your micro-services will be run across different application servers with traffic load balanced across the these instances. 
	* If one of these instances fails suddenly all traffic will be load balanced across to the remaining instances of that microservice. The tax platform will also respond by monitoring the web-operations team in order that they can resurrect the application server that has died.
	* If traffic increases towards a volume we deem dangerous for the current infrastructure monitoring will alert the web-operations team and more application servers/instances of your application will be added to the tax platform to cope with that traffic. 


[development environment]:      https://confluence.tools.tax.service.gov.uk/display/DTRG/05+Deploying+to+Dev
[QA environment]:				https://confluence.tools.tax.service.gov.uk/display/DTRG/10+Deploying+to+Web-QA
[staging environment]:			https://confluence.tools.tax.service.gov.uk/pages/viewpage.action?title=11+Deploying+to+Staging&spaceKey=DTRG
[step by step guide]:			https://confluence.tools.tax.service.gov.uk/display/WEBOPS/Step+by+Step+Guide+to+Production+Releases
[release form]:					https://releaseform.tax.service.gov.uk/
[PRR]:							https://confluence.tools.tax.service.gov.uk/display/DTRG/Platform+Readiness+Assessment
[announcements]:				https://groups.google.com/a/digital.hmrc.gov.uk/forum/#!forum/ddc-tax-plat-live-ops-announcements




