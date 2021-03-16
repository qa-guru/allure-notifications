![build-jar](https://github.com/qa-guru/allure-notifications/workflows/build-jar/badge.svg?branch=master&event=push)

<h3>Allure notifications script</h3>
for telegram, slack, email (//todo)

jar, that draws piechart from results `allure-report/widgets/summary.json` and sends it with link to build to telegram-chat / slack / mattermost / email (//todo)

![shakal screenshot_en](shakal-screenshot_en.png)![shakal screenshot_ru](shakal-screenshot_ru.png)![shakal screenshot_ua](shakal-screenshot_ua.png)

<h3>Telegram config:</h3>
0. Create telegram bot in @BotFather and add it to your telegram chat.<br/>
Remember <b>telegram bot secret</b><br/>
Remember <b>telegram chat id</b>, you can find here -> https://api.telegram.org/bot{telegram_bot_secret}/getUpdates (bot needs admin rights)<br/>
1. You can download ready jar https://github.com/qa-guru/allure-notifications/releases or clone project and build .jar yourself: <br/>
`gradle jar` -> build/libs/allure-notifications-*.jar <br/>
2. Put allure-notifications-*.jar in your in root folder of your autotests project (yes, its awful, but kiss). <br/>
3. Run it after allure-report is generated, 
for example Jenkins postbuild task (Post build plugin required https://plugins.jenkins.io/postbuild-task/): <br/>
`java -jar allure-notifications-2.0.5.jar -ch true -s telegram_bot_secret -c telegram_chat_id -p ${JOB_BASE_NAME} -f allure-report/ -b ${BUILD_URL} -n "Allure piechart telegram bot Release 2.0" -e https://qa.guru -l ru` <br/>
![jenkins config](jenkins-config.png)

<h3>Mattermost config:</h3>
0.Create mattermost bot in your team and get access token
![mattermost-bot-page](mattermostbotpage.png)

1.Get channel id when you want to get notifications<br/>
![mattermost-channel-id](mattermostchannelid.png)<br/>

2.Add mattermost server url to command line option 
example `-u notifytest.cloud.mattermost.com` and set messenger `-m mattermost`<br/>

3.Final result<br/>
![mattermost-channel-id](mattermostfinal.png)


<h3>CommandLine options</h3>

You can run bot using cmd options: <br/>
`-ch, --chart - Enable/disable PieChart diagram (false by default);` <br/>
`-s, --secret, --token - Set telegram bot secret token;` <br/>
`-c, --chat, --id - Set telegram chat id;` <br/>
`-p, --project - Set project name;` <br/>
`-f, --folder, --allure - Set allure report folder;` <br/>
`-b, --build, --link - Set link to build;` <br/>
`-n, --name - Set launch name;` <br/>
`-e, --env - Set environment;` <br/>
`-l, --lang - Set template language (possible values are: ru, en, ua). English by default.` <br/>
`-u, --mmUrl - Set mattermost server Url;` <br/>
Pay attention, all options (except `-ch` and `-l`) are required.

Slack configure is in progress!
