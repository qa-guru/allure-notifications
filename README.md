# Allure notifications
**Allure notifications** - this is a library that allows you to automatically notify about the results of passing autotests, which is sent to the messenger you need (Telegram, Slack, Skype, Email, Mattermost).

Languages: 🇬🇧 🇫🇷 🇷🇺 🇺🇦 🇧🇾 🇨🇳
 
## Contents
+ [How it works](#How)
+ [What notifications look like](#Example)
+ [How to use it in your project:](#Settings)
   + [to run locally](#Local)
   + [to run from Jenkins](#Jenkins)
+ [Features of filling in the config file.json depending on the chosen messenger](#config)

 
<a name="How">
 
## How it works
Based on the results of the autotests, a summary file is generated.json in the allure-report/widgets folder. 
This file contains general statistics on the results of passing tests, on the basis of which a notification is generated that the bot sends (a diagram is drawn and the corresponding text is added).
 
<img width="1022" alt="image" src="https://user-images.githubusercontent.com/109241600/215502835-82bfee8c-63cb-4569-95d9-e9f55128b3f7.png">


Example of the summary.json
```
{
  "reportName" : "Allure Report",
  "testRuns" : [ ],
  "statistic" : {
    "failed" : 182,
    "broken" : 70,
    "skipped" : 118,
    "passed" : 439,
    "unknown" : 42,
    "total" : 851
  },
  "time" : {
    "start" : 1590795193703,
    "stop" : 1590932641296,
    "duration" : 11311,
    "minDuration" : 7901,
    "maxDuration" : 109870,
    "sumDuration" : 150125
  }
}
```
 
 
<a name="Example">
 
## What notifications look like
Example of a notification in Telegram

<img width="333" alt="image" src="https://user-images.githubusercontent.com/109241600/213396660-c70adc4c-7a0f-4926-8d9d-473c6c433dd2.png">

<a name="Settings">

## How to use it in your project

 
<a name="Local">

### To run locally
1. For local debugging, you need to install java (you won't need it to run in Jenkins)
2. Create a folder in the root of the project `notifications`.
3. <a href="https://github.com/qa-guru/allure-notifications/releases" target="_blank">Download</a> the current version of the file `allure-notifications-version.jar`, and place it in the folder `notifications` in your project.
4. In the `notifications` folder, create a `config.json` file with the following structure (leave the `base` section and the messenger to which you want to send notifications):
```
{
  "base": {
    "logo": "",
    "project": "",
    "environment": "",
    "comment": "",
    "reportLink": "",
    "language": "ru",
    "allureFolder": "",
    "enableChart": false
  },
  "telegram": {
    "token": "",
    "chat": "",
    "replyTo": ""
  },
  "slack": {
    "token": "",
    "chat": "",
    "replyTo": ""
  },
  "mattermost": {
    "url": "",
    "token": "",
    "chat": ""
  },
  "skype": {
    "appId": "",
    "appSecret": "",
    "serviceUrl": "",
    "conversationId": "",
    "botId": "",
    "botName": ""
  },
  "mail": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "securityProtocol": null,
    "from": "",
    "recipient": ""
  },
  "proxy": {
    "host": "",
    "port": 0,
    "username": "",
    "password": ""
  }
}
```
The `proxy` block is used if you need to specify an additional proxy configuration.

<a name="Base">

5. Fill in the `base` block in the `config.json` file:

Example of filling in the `base' block:
```
"base": {
    "logo": "logo.png",
    "project": "some project",
    "environment": "some env",
    "comment": "some comment",
    "reportLink": "",
    "language": "en",
    "allureFolder": "build/allure-report/",
    "enableChart": true
  }
```  
The order of filling in:
+ `project`, `environment`, `comment` - the name of the project, the name of the environment and an arbitrary comment.
+ `reportLink` - a link to the Allure report with the results of passing autotests (it is advisable to fill in when launching autotests from Jenkins - more on this below)
+ `language` - the language in which the text for the notification will be generated (options: en / fr / ru / ua / by / cn)
+ `allureFolder` - the path to the folder with the results of Allure
+ `enableChart` - do I need to display a chart (options: true / false)
+ `logo` - the path to the file with the logo (if filled in, the corresponding logo will be displayed in the upper left corner of the diagram).

6. Fill in the `config.json` file a block with information about the selected messenger: [features of filling in the config file.json depending on the chosen messenger](#config)
 
7. Execute the following command in the terminal:
```
java "-DconfigFile=notifications/config.json" -jar notifications/allure-notifications-4.2.1.jar
``` 
Note:
+ at the time of launch, a file should already be generated `summary.json`
+ in the command text, you need to specify the version of the jar file that you downloaded in the previous steps

As a result, an alert will be generated with the results of passing autotests and sent to the selected messenger.
 

<a name="Jenkins">
 
### To run from Jenkins
1. Go to Job settings in Jenkins
2. In the `Build` section, click `Add build step`, in the menu select `Create/Update Text File`

<img width="714" alt="image" src="https://user-images.githubusercontent.com/109241600/215503405-7014f98d-f388-44de-931e-a0272c97b6a1.png">


Fill in as follows:

<img width="745" alt="image" src="https://user-images.githubusercontent.com/109241600/213294133-164df8c0-85da-4059-97e7-3e4c8a386538.png">
<img width="744" alt="image" src="https://user-images.githubusercontent.com/109241600/213294275-31a5efeb-d400-496d-b963-c6071f187e94.png">

Note:
+ General information about filling in the `base` block is described [in this section](#Base)
+ In the following parameters, we specify variables as values: `"project": "${JOB_BASE_NAME}"` and `"reportLink": "${BUILD_URL}"`. When forming a notification, the name will be indicated in these fields `JOB` and a link to `BUILD` in Jenkins.
+ Features of filling the file config.json depending on the chosen messenger, the following are described [in this section](#config)

3. In the `Post-build Actions` section, click the `Add post-build action` button, in the menu that appears, select `Post build task`

<img width="752" alt="image" src="https://user-images.githubusercontent.com/109241600/215503598-c493077f-7234-4619-ad44-2fcb53888203.png">

+ In the `Script` field, specify the following:
```
cd ..
FILE=allure-notifications-4.2.1.jar
if [ ! -f "$FILE" ]; then
   wget https://github.com/qa-guru/allure-notifications/releases/download/4.2.1/allure-notifications-4.2.1.jar
fi
```
Note: 
In this script, we go to the folder above, if there is no jar file there, then download it. It is necessary to specify <a href="https://github.com/qa-guru/allure-notifications/releases" target="_blank">the current version of the file jar</a>

+ Click `Add another task` and in the second field `Script` specify the following:
```
java "-DconfigFile=notifications/config.json" -jar ../allure-notifications-4.2.1.jar
```
 
4. Save the settings changes and run autotests. Upon completion, a notification of the results will be sent to the messenger.
 

<a name="config">

## Features of filling in the config file.json depending on the chosen messenger
+ <a href="https://github.com/qa-guru/knowledge-base/wiki/11.-Телеграм-бот.-Отправляем-уведомления-о-результатах-прохождения-тестов" target="_blank">Telegram config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Slack-configuration" target="_blank">Slack config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Email-configuration" target="_blank">Email config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Skype-configuration" target="_blank">Skype config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Mattermost-configuration" target="_blank">Mattermost config</a>
