[![ru](https://img.shields.io/badge/lang-ru-red.svg)](https://github.com/qa-guru/allure-notifications/blob/master/README.md)

# Allure notifications
**Allure notifications** is the library that allows to send automatic notifications about the results of automated tests to your preferred messenger (Telegram, Slack, Skype, Email, Mattermost, Discord, Loop, Rocket.Chat).

Notification languages: 🇬🇧 🇫🇷 🇷🇺 🇺🇦 🇧🇾 🇨🇳

## Content
+ [How it works](#how-it-works)
+ [What the notifications look like](#what-the-notifications-look-like)
+ [How to use in your project](#how-to-use-in-your-project)


## How it works
After an autotest has finished its work, the `summary.json` file is generated in the `allure-report/widgets` folder. This file contains general statistic about the test results and uses to form the notification sent by the bot (with the diagram and corresponding text).

Example of a `summary.json` file
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
In addition, if the Allure Summary plugin is connected, `suites.json` file will also be generated, and data from this file will be included in the statistic.

## What the notifications look like
Example of a notification in Telegram

![telegram](https://user-images.githubusercontent.com/109241600/213396660-c70adc4c-7a0f-4926-8d9d-473c6c433dd2.png)

## How to use in your project

1. Setup Java
2. Create `notifications` folder in the root of your project
3. Download [the latest version](https://github.com/qa-guru/allure-notifications/releases) of the `allure-notifications-<version>.jar` file and place it in the `notifications` folder in your project
4. In the `notifications` folder create the `config.json` file with the following structure (keep the base section and the messenger to which notifications need to be sent):
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
    "enableChart": false,
    "enableSuitesPublishing": false,
    "customData": {}
  },
  "telegram": {
    "token": "",
    "chat": "",
    "topic": "",
    "replyTo": "",
    "templatePath": "/templates/telegram.ftl"
  },
  "slack": {
    "token": "",
    "chat": "",
    "replyTo": "",
    "templatePath": "/templates/markdown.ftl"
  },
  "mattermost": {
    "url": "",
    "token": "",
    "chat": "",
    "templatePath": "/templates/markdown.ftl"
  },
  "rocketChat" : {
    "url": "",
    "auth_token": "",
    "user_id": "",
    "channel": "",
    "templatePath": "/templates/rocket.ftl"
   },
  "skype": {
    "appId": "",
    "appSecret": "",
    "serviceUrl": "",
    "conversationId": "",
    "botId": "",
    "botName": "",
    "templatePath": "/templates/markdown.ftl"
  },
  "mail": {
    "host": "",
    "port": "",
    "username": "",
    "password": "",
    "securityProtocol": null,
    "from": "",
    "to": "",
    "cc": "",
    "bcc": "",
    "templatePath": "/templates/html.ftl"
  },
  "discord": {
    "botToken": "",
    "channelId": "",
    "templatePath": "/templates/markdown.ftl"
  },
  "loop": {
    "webhookUrl": "",
    "templatePath": "/templates/markdown.ftl"
  },
  "proxy": {
    "host": "",
    "port": 0,
    "username": "",
    "password": ""
  }
}
```

The `proxy` block is used if you need to specify additional proxy configuration.\
The `templatePath` parameter is optional and allows to set the path to custom Freemarker template for notification message.\
Example:
```
{
  "base": {
    ...
  },
  "mail": {
    "host": "smtp.gmail.com",
    "port": "465",
    "username": "username",
    "password": "password",
    "securityProtocol": "SSL",
    "from": "test@gmail.com",
    "to": "test1@gmail.com",
    "cc": "testCC1@gmail.com, testCC2@gmail.com",
    "bcc": "testBCC1@gmail.com, testBCC2@gmail.com",
    "templatePath": "/templates/html_custom.ftl"
  }
}
```
5. Fill the `base` block in the `config.json` file

Example:
```
"base": {
    "project": "some project",
    "environment": "some env",
    "comment": "some comment",
    "reportLink": "",
    "language": "en",
    "allureFolder": "build/allure-report/",
    "enableChart": true,
    "enableSuitesPublishing": true,
    "logo": "logo.png",
    "durationFormat": "HH:mm:ss.SSS",
    "customData": {
      "variable1": "value1",
      "variable2": "value2"
    }
}
```

Fields:
+ `project`, `environment`, `comment` - the name of the project, the name of the environment, and a custom comment.
+ `reportLink` - the link to the Allure report with results of tests.
+ `language` - the language in which the notification text will be formed (options: `en` / `fr` / `ru` / `ua` / `by` / `cn`).
+ `allureFolder` - the path to the folder with Allure results.
+ `enableChart` - whether the chart should be displayed (options: `true` / `false`).
+ `enableSuitesPublishing` - whether the statistic per suite should be published (options: `true` / `false`, default `false`). Before enabling the option, make sure that the `<allureFolder>/widgets` folder contains JSON file `suites.json`
+ `logo` - path to the logo file (if filled, the corresponding logo will be displayed in the top left corner of the chart).
+ `durationFormat` (optional, default value is `HH:mm:ss.SSS`) - specifies the desired output format for the test duration.
+ `customData` - additional data that can be reused in custom Freemarker templates (optional field).
6. Fill in the `config.json` file block with the information about the chosen messenger.
7. Execute the following command in terminal:
```
java "-DconfigFile=notifications/config.json" -jar notifications/allure-notifications-4.6.1.jar
```
Note:

+ The `summary.json` file should already be generated by the time of execution.
+ You need to specify the version of the `jar` file that you downloaded in the previous steps in the command-line text.
+ Configuration can be overridden via system properties (System property will take precedence over the configuration
  entry if it is specified in the file). 
  ```shell
    java "-DconfigFile=notifications/config.json" "-Dnotifications.base.environment=${STAND}" "-Dnotifications.base.reportLink=${ALLURE_SERVICE_URL}" "-Dnotifications.base.project=${PROJECT_ID}" "-Dnotifications.telegram.token=${TG_BOT_TOKEN}" "-Dnotifications.telegram.chat=${TG_CHAT_ID}" "-Dnotifications.telegram.topic=${TG_CHAT_TOPIC_ID}" -jar allure-notifications.jar
  ```

  :information_source: The property prefixes for custom data parameters are removed: system property
  `-Dbase.customData.variable1=someValue` will result in data with key `variable1` with value `someValue`.

  :warning: `customData` parameter without name is allowed: `base.customData.`

## Messenger configurations
+ <details>
    <summary>Telegram config</summary>
    The `telegram` block parameters:
    <ul>
      <li><code>topic</code> - optional parameter defining unique identifier for the target message thread (topic) of
        the chat to send the message to; check [Stackoverflow answers](https://stackoverflow.com/questions/74773675/how-to-get-topic-id-for-telegram-group-chat)
        to find out how to get the parameter value.
      </li>
    </ul>
  </details>
