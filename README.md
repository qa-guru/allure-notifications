<h1>Allure notifications :sun_with_face:</h1>
<h6>for telegram, slack, skype, email, mattermost</h6>

<h3>Languages:</h3>

![](readme_images/languages/United-Kingdom.png) ![](readme_images/languages/France.png) ![](readme_images/languages/Russia.png) ![](readme_images/languages/Ukraine.png)</h5>

| Telegram | Slack |
:-------------------------:|:-------------------------:
![shakal_screenshot](readme_images/telegram-en.png) | ![shakal_screenshot](readme_images/slack-en.png)
| **Skype** | **Email** |
`// todo` [#32](https://github.com/qa-guru/allure-notifications/issues/32) :nerd_face::computer: | ![shakal_screenshot](readme_images/email_en.png) 

<h6>How to:</h6>

- [x] [Telegram config](https://github.com/qa-guru/allure-notifications/wiki/Telegram-configuration)
- [x] [Slack config](https://github.com/qa-guru/allure-notifications/wiki/Slack-configuration)
- [ ] [Email config](https://github.com/qa-guru/allure-notifications/wiki/Email-configuration)
- [ ] [Skype config](https://github.com/qa-guru/allure-notifications/wiki/Skype-configuration)
- [ ] [Mattermost config](https://github.com/qa-guru/allure-notifications/wiki/Skype-configuration)


<h6>CommandLine options</h6>
All keys should be used with `-D`: <br/> 

| key | telegram | slack | email | mattermost | description |
:----:|:--------:|:-----:|:-----:|:----------:|:------------:
messenger            | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | telegram (default), slack, email, mattermost 
bot.token            | :heavy_check_mark: | :heavy_check_mark: | :x:                | :heavy_check_mark: | Bot/app secret token
chat.id              | :heavy_check_mark: | :heavy_check_mark: | :x:                | :heavy_check_mark: | Chat/channel id
reply.to.message.id  | :heavy_check_mark: | // todo            | :x:                | :heavy_check_mark: | Message id for reply
mail.host            | :x:                | :x:                | :heavy_check_mark: | :x:                | Smtp server
mail.port            | :x:                | :x:                | :heavy_check_mark: | :x:                | Smtp port
mail.username        | :x:                | :x:                | :heavy_check_mark: | :x:                | From email username
mail.password        | :x:                | :x:                | :heavy_check_mark: | :x:                | From email password
mail.to              | :x:                | :x:                | :heavy_check_mark: | :x:                | To email list - a@a.a, b@b.b
mattermost.api.url   | :x:                | :x:                | :x:                | :heavy_check_mark: | Mattermost api url
project.name         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Project name
build.launch.name    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Build launch name
build.env            | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Build environment
build.report.link    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Build report link
lang                 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Supported languages: en, fr, ru, ua
enable.chart         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Enable/disable PieChart diagram (false by default)
allure.report.folder | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | Set allure report folder

```
java  \
"-Dmessenger=${MESSENGER}" \
"-Dchat.id=${CHAT}" \
"-Dbot.token=${SECRET}" \
"-Dmail.host=${SMTP_SERVER}" \
"-Dmail.port=${SMTP_PORT}" \
"-Dmail.username=${EMAIL_USER}" \
"-Dmail.password=${EMAIL_PASSWORD}" \
"-Dmail.to=${EMAIL}" \
"-Dmattermost.api.url=${MATTERMOST_API_URL}" \
"-Dproject.name=${JOB_BASE_NAME}" \
"-Dbuild.launch.name=${SOME_LAUNCH_NAME}" \
"-Dbuild.env=${ENVIRONMENT}" \
"-Dbuild.report.link=${BUILD_URL}" \
"-Dlang=${LANGUAGE}" \
"-Denable.chart=${CHART}" \
"-Dallure.report.folder=./allure-report/" \
-jar allure-notifications-2.2.1.jar
```

If you want the project logo to appear in the upper left corner of the chart, 
add the file logo.png to root of project 
