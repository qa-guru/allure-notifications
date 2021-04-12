<h1>Allure notifications :sun_with_face:</h1>
<h4>for telegram, slack, email, mattermost</h4>

Just put <b>allure-notifications.jar</b> in your project root and it will draw <u>piechart.png</u> (from `allure-report/widgets/summary.json`) and send it to any messenger!<br/>
<h5>Languages: en, ru, ua </h5>

| Telegram | Slack |
:-------------------------:|:-------------------------:
![shakal_screenshot](readme_images/telegram-en.png) | ![shakal_screenshot](readme_images/slack-en.png)


<h6>Telegram config</h6>

0. Create telegram bot in @BotFather and add it to your telegram chat.<br/>
Remember <b>telegram bot secret</b><br/>
Remember <b>telegram chat id</b>, you can find here -> https://api.telegram.org/bot{telegram_bot_secret}/getUpdates (bot needs admin rights)<br/>
1. Download latest release https://github.com/qa-guru/allure-notifications/releases or build .jar yourself: <br/>
`gradle jar` -> build/libs/allure-notifications-*.jar <br/>
2. Put allure-notifications-*.jar in your in your autotests project root (sorry, but kiss). <br/>
3. Run it after allure-report is generated, 
for example Jenkins postbuild task (Post build plugin required https://plugins.jenkins.io/postbuild-task/): <br/>

`java -jar allure-notifications-2.2.1.jar -Dchat.id=XXXXXX -Dbot.token=XXXXXXXXX -Dproject.name=${JOB_BASE_NAME} -Dbuild.report.link=${BUILD_URL}" -Dbuild.launch.name="Fake release v0.1.2.3" -Dallure.report.folder=./allure-report/ " -Dlaunch.name=Allure-notifications-release 2.1 -Denv=https://github.com/qa-guru/allure-notifications -Denable.chart=true -Dlang=en -Dmessenger=telegram  -Dbuild.env=https://github.com/qa-guru/allure-notifications` <br/>

![jenkins config](readme_images/jenkins_config.png)

- [x] Telegram config
- [ ] Slack config
- [ ] Email config

<h6>CommandLine options</h6>
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
