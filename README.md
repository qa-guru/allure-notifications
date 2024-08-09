[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/qa-guru/allure-notifications/blob/master/README.en.md)

# Allure notifications
**Allure notifications** - это библиотека, позволяющая выполнять автоматическое оповещение о результатах прохождения автотестов, которое направляется в нужный вам мессенджер (Telegram, Slack, Skype, Email, Mattermost, Discord, Loop, Rocket.Chat).

Languages: 🇬🇧 🇫🇷 🇷🇺 🇺🇦 🇧🇾 🇨🇳
 
## Содержание
+ [Принцип работы](#Принцип)
+ [Как выглядят оповещения](#Примеры)
+ [Как использовать в своем проекте:](#Настройка)
   + [для запуска локально](#Локально)
   + [для запуска из Jenkins](#Jenkins)
+ [Особенности заполнения файла config.json в зависимости от выбранного мессенджера](#config)

 
<a name="Принцип">
 
## Принцип работы
По итогам выполнения автотестов генерируется файл summary.json в папке allure-report/widgets. 
Этот файл содержит общую статистику о результатах прохождения тестов, на основании которой как раз и формируется уведомление, которое отправляет бот (отрисовывается диаграмма и добавляется соответствующий текст).
 
<img width="1021" alt="image" src="https://user-images.githubusercontent.com/109241600/213257051-977acd4d-5793-4b2e-b16b-c0e0c6c10194.png">
 

Пример файла summary.json
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
Кроме этого, если подключен Allure Summary плагин также будет сгенерирован файл `suites.json` данные из которого также будут включены в статистику. 

 
<a name="Примеры">
 
## Как выглядят оповещения
Пример оповещения в Telegram

<img width="333" alt="image" src="https://user-images.githubusercontent.com/109241600/213396660-c70adc4c-7a0f-4926-8d9d-473c6c433dd2.png">

<a name="Настройка">

## Как использовать в своем проекте

 
<a name="Локально">

### Для запуска локально
1. Для локальной отладки нужно установить java (для запуска в Jenkins она не понадобится)
2. Создать в корне проекта папку `notifications`.
3. <a href="https://github.com/qa-guru/allure-notifications/releases" target="_blank">Скачать</a> актуальную версию файла `allure-notifications-version.jar`, и разместить его в папке `notifications` в своем проекте.
4. В папке `notifications` создать файл `config.json` со следующей структурой (оставить раздел `base` и тот мессенджер, на который требуется отправлять оповещения): 
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
    "recipient": "",
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
Блок `proxy` используется если нужно указать дополнительную конфигурацию proxy.\
Параметр `templatePath` является опциональным и позволяет установить путь к собственному Freemarker шаблону для сообщения. 
Пример:
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
    "recipient": "test1@gmail.com",
    "templatePath": "/templates/html_custom.ftl"
  }
}
```

<a name="Base"></a>

5. Заполнить в файле `config.json` блок `base`: 

Пример заполнения блока `base`:
```
"base": {
    "project": "some project",
    "environment": "some env",
    "comment": "some comment",
    "reportLink": "",
    "language": "en",
    "allureFolder": "build/allure-report/",
    "enableChart": true,
    "logo": "logo.png",
    "durationFormat": "HH:mm:ss.SSS"
}
```  
Порядок заполнения:
+ `project`, `environment`, `comment` - имя проекта, название окружения и произвольный комментарий. 
+ `reportLink` - ссылка на Allure report с результатами прохождения автотестов (целесообразно заполнять при запуске 
  автотестов из Jenkins - об этом ниже).
+ `language` - язык, на котором будет сформирован текст для оповещения (варианты: en / fr / ru / ua / by / cn).
+ `allureFolder` - путь к папке с результатами работы Allure.
+ `enableChart` - требуется ли отображать диаграмму (варианты: true / false).
+ `logo` - путь к файлу с логотипом (если заполнено, то в левом верхнем углу диаграммы будет отображаться соответствующий логотип).
+ `durationFormat` (optional, default value is `HH:mm:ss.SSS`) - specifies the desired output format for tests duration.

6. Заполнить в файле `config.json` блок с информацией о выбранном мессенджере: [особенности заполнения файла config.json в зависимости от выбранного мессенджера](#config)
 
7. Выполнить в терминале следующую команду:
```
java "-DconfigFile=notifications/config.json" -jar notifications/allure-notifications-4.2.1.jar
``` 
Примечание:
+ на момент запуска уже должен быть сформирован файл `summary.json`
+ в тексте команды нужно указать ту версию файла jar, которую вы скачали на предыдущих шагах

В результате будет сформировано оповещение с результатами прохождения автотестов и направлено в выбранный мессенджер.
 

<a name="Jenkins">
 
### Для запуска из Jenkins
1. Перейти в настройки сборки в Jenkins
2. В разделе `Сборка` нажать кнопку `Добавить шаг собрки`, в появившемся меню выбрать `Create/Update Text File`
<img width="739" alt="image" src="https://user-images.githubusercontent.com/109241600/213293791-75eecef5-9e6d-449b-9b10-520561e2f112.png">

Заполнить следующим образом:

<img width="745" alt="image" src="https://user-images.githubusercontent.com/109241600/213294133-164df8c0-85da-4059-97e7-3e4c8a386538.png">
<img width="744" alt="image" src="https://user-images.githubusercontent.com/109241600/213294275-31a5efeb-d400-496d-b963-c6071f187e94.png">

Примечание:
+ Общая информация о заполнении блока `base` описана [в этом разделе](#Base)
+ В следующих параметрах в качестве значений указываем переменные: `"project": "${JOB_BASE_NAME}"` и `"reportLink": "${BUILD_URL}"`. При формировании уведомления в данных полях будут указаны название `JOB` и ссылка на `BUILD` в Jenkins.
+ Особенности заполнения файла config.json в зависимости от выбранного мессенджера описаны [в этом разделе](#config)

3. В разделе `Послесборочные операции` нажать кнопку `Добавить шаг после собрки`, в появившемся меню выбрать `Post build task`
<img width="743" alt="image" src="https://user-images.githubusercontent.com/109241600/213299612-d28334c1-5dba-4e53-9f8d-32ef40b713ad.png">

+ В поле `Script` указываем следующее:
```
cd ..
FILE=allure-notifications-4.2.1.jar
if [ ! -f "$FILE" ]; then
   wget https://github.com/qa-guru/allure-notifications/releases/download/4.2.1/allure-notifications-4.2.1.jar
fi
```
Примечание: 
В этом скрипте мы переходим на папку выше, если там нет jar файла, то скачиваем его. Необходимо указать <a href="https://github.com/qa-guru/allure-notifications/releases" target="_blank">актуальную версию файла jar</a>

+ Нажимаем `Add another task` и во втором поле `Script` указываем следующее:
```
java "-DconfigFile=notifications/config.json" -jar ../allure-notifications-4.2.1.jar
```
 
4. Сохраняем изменения настроек и запускаем автотесты. По завершении в мессенджер будет направлено уведомление о результатах.
 

<a name="config">

## Особенности заполнения файла config.json в зависимости от выбранного мессенджера
+ <a href="https://github.com/qa-guru/knowledge-base/wiki/11.-Телеграм-бот.-Отправляем-уведомления-о-результатах-прохождения-тестов" target="_blank">Telegram config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Slack-configuration" target="_blank">Slack config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Email-configuration" target="_blank">Email config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Skype-configuration" target="_blank">Skype config</a>
+ <a href="https://github.com/qa-guru/allure-notifications/wiki/Mattermost-configuration" target="_blank">Mattermost config</a>
+ <details>
    <summary>Discord config</summary>
    To enable Discord notifications it's required to provide 2 configuration parameters: <code>botToken</code> and <code>channelId</code>.
    <ul>
    <li>To create your own Discord bot and get its token follow these steps.
      <ol>
        <li>Turn on “Developer mode” in your Discord account.</li>
        <li>Click on “Discord API”.</li>
        <li>In the Developer portal, click on “Applications”. Log in again and then, back in the “Applications” menu, click on “New Application”.</li>
        <li>Name the bot and then click “Create”.</li>
        <li>Go to the “Bot” menu and generate a token using “Add Bot”.</li>
        <li>Copy the bot’s token and paste it into the JSON config</li>
        <li>Define other details for your bot under “General Information”.</li>
        <li>Click on “OAuth2”, activate “bot”, set the permissions, and then click on “Copy”.</li>
        <li>Select your server to add your bot to it.</li>
    </ol>
    </li>
    <li>To get a Channel ID right click the channel and click on "Copy ID" then paste it into the JSON config. Alternatively type the channel as a mention and place a backslash \ in front of the mention.</li>
    </ul>
  </details>
+ <details>
    <summary>Loop config</summary>
    To create your own Loop webhook URL follow these steps.
    <ul>
      <li>Go to main menu of Loop application.</li>
      <li>Click "Integrations".</li>
      <li>Choose "Incoming Webhooks".</li>
      <li>Click "Add Incoming Webhook".</li>
      <li>Fill out the form fields on your choice, make sure to select a channel for messages.</li>
      <li>Click "Save".</li>
      <li>Copy URL of webhook.</li>
    </ul>
  </details>
+ <details>
      <summary>Rocket.Chat config</summary>
      To enable Rocket.Chat notifications it's required to provide 4 configuration parameters: 
  <code>url</code>, <code>auth_token</code>,<code>user_id</code>,<code>channel</code>
      <ul>
    <li>
      <ol>
        <li>First of all you need to generate auth_token from user setting.</li>
        <li>After generation you can get auth_token and user_id.</li>
        <li>You can get the channel parameter using previously generated tokens and following the <a href="https://developer.rocket.chat/reference/api/rest-api/endpoints/rooms/channels-endpoints/info" target="_blank">documentation</a>.</li>
    </ol>
    </li>
    </ul>
  </details>
