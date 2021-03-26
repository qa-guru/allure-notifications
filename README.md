## Allure notifications script
* Telegram
* Slack
* Mattermost
* TODO Email, Skype.

Jar file, that create piechart from results `allure-report/widgets/summary.json` and sends it with link to build to messenger you choose.  

Supports 3 languages. English, Russian, Ukrainian.  

<img src="images/shakal-screenshot_en.png" alt="EN Telegram" width="250"/>
<img src="images/shakal-screenshot_ru.png" alt="RU Telegram" width="250"/>
<img src="./images/shakal-screenshot_ua.png" alt="UA Telegram" width="250"/>

### Telegram config:
0. Create telegram bot in @BotFather and add it to your telegram chat.<br/>
Remember <b>telegram bot secret</b><br/>
Remember <b>telegram chat id</b>, you can find here -> https://api.telegram.org/bot{telegram_bot_secret}/getUpdates (bot needs admin rights)<br/>
1. You can download ready jar https://github.com/qa-guru/allure-notifications/releases or clone project and build .jar yourself: <br/>
`gradle jar` -> build/libs/allure-notifications-*.jar <br/>
2. Put allure-notifications-*.jar in your in root folder of your autotests project (yes, its awful, but kiss). <br/>
3. Run it after allure-report is generated, 
for example Jenkins postbuild task (Post build plugin required https://plugins.jenkins.io/postbuild-task/): <br/>
`java -jar allure-notifications-2.0.5.jar -ch true -s telegram_bot_secret -c telegram_chat_id -p ${JOB_BASE_NAME} -f allure-report/ -b ${BUILD_URL} -n "Allure piechart telegram bot Release 2.0" -e https://qa.guru -l ru` <br/>
![jenkins config](images/jenkins-config.png)

<h3>CommandLine options</h3>

You can run bot using cmd options: <br/>
<table>
    <thead>
        <tr>
            <th>Telegram</th><th>Slack</th><th>Email</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Create telegram bot</td><td>Create slack app</td><td></td>
        </tr>
        <tr>
            <td>Add telegram bot to chat</td><td>Add app to slack channel</td><td></td>
        </tr>
        <tr>
            <td colspan="3">Configure step in build server</td>
        </tr>
    </tbody>
</table>

All keys should be used with `-D`: <br/> 
`build.launch.name - Set build launch name` <br/>
`build.env - Set build environment` <br/>
`build.report.link - Set build report link` <br/>
`lang - Set language (possible values are: ru, en, ua)` <br/>
`enable.chart - Enable/disable PieChart diagram (false by default)` <br/>
`bot.token - Set bot secret token` <br/>
`chat.id - Set chat id` <br/>
`project.name - Set project name` <br/>
`allure.report.folder - Set allure report folder` <br/>
`messenger - Set target messenger (possible values are: telegram, slack, mattermost)` <br/>
`mattermost.api.url - Set mattermost api url` <br/>
Pay attention, all options (except `enable.chart` and `messenger`) are required. Telegram is a default messenger.

Slack configure is in progress!
