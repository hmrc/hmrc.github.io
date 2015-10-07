---
layout: post
title: Live assessment
category: The HMRC Tax Platform
---

Once you get to live assessment you will have been running a fully functioning service for a while. By this stage you will have iterated on your service until it is ready for live. There is not much else the platform can offer you more than the perks you will have already experience. However with the transition from Beta to Live comes a greater expectation from our users and the tax platform can offer the following to help you meet these expectations...

### Dynamic response to increasing volume

We understand that live services need to be prepared to take sudden and unexpected increases in volume without issue. Therefore we have developed the tax platform in a way which enables us to scale at speed in response to these events. 

Currently we run n+1 instances of your micro-service where n = "the number of micro-services that can take the expected traffic". We will never load more than one instance of a micro-service to an application server, the app server/micro-service relationship can only be 1:1 or 1:0. We will also always have additional app servers in the 1:0 relationship ready to support additional instances of your micro-services if n increases: 

<img src="{{ site.baseurl }}/images/infrastructure scaling before.jpg" alt="Constructocat by https://github.com/jasoncostello" style="width: 600px;"/>

If actual traffic increases n will also, therefore the platform must respond by building more micro-service instances. Monitoring and alerting will make the web-operations team aware that n has increased and they will respond by changing the expected state of the tax platform to include more instances of the required app. Once this change has been made the platform will respond by building new instances of the app on the remaining micro-services. Increasing the number of instances of an app takes minutes.

<img src="{{ site.baseurl }}/images/infrastructure scaling after.jpg" alt="Constructocat by https://github.com/jasoncostello" style="width: 600px;"/>

The total number of micro-services is determined by keeping our ability to scale the number of any micro-service. This ensures that we can always scale. If we approach the situation whereby we cannot add instances of a micro-service without using a 1:2 app server to micro-service ratio we will increase the number of application servers. Increasing the number of app servers is not automated to the same degree as increasing micro-service instances and can take an hour. We are currently working on automating this process. 

### Operational testing

One of the key things to establish is how the tax platform responds to the incidents which effect the live service. Through testing and public beta you will have experienced the process which occurs when there is a live incident. However once a service is live the platform understand that different teams will require different responses from the web-operations team in live. 

Therefore before going to live we suggest that we run a live service incident management exercise. To arrange this exercise please contact <tim.britten@digital.hmrc.gov.uk>.

