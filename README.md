# Allure notifications
**Allure notifications** - это библиотека, позволяющая выполнять автоматическое оповещение о результатах прохождения автотестов, которое направляется в нужный вам мессенджер (Telegram, Slack, Skype, Email, Mattermost).

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
  },
   "cliq": {
      "token": "",
      "chat": "",
      "bot": ""
   }
}
```
Блок `proxy` используется если нужно указать дополнительную конфигурацию proxy.

<a name="Base">

5. Заполнить в файле `config.json` блок `base`: 

Пример заполнения блока `base`:
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
Порядок заполнения:
+ `project`, `environment`, `comment` - имя проекта, название окружения и произвольный комментарий. 
+ `reportLink` - ссылка на Allure report с результатами прохождения автотестов (целесообразно заполнять при запуске автотестов из Jenkins - об этом ниже)
+ `language` - язык, на котором будет сформирован текст для оповещения (варианты: en / fr / ru / ua / by / cn)
+ `allureFolder` - путь к папке с результатами работы Allure
+ `enableChart` - требуется ли отображать диаграмму (варианты: true / false)
+ `logo` - путь к файлу с логотипом (если заполнено, то в левом верхнем углу диаграммы будет отображаться соответствующий логотип).

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
