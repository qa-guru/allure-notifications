![build-jar](https://github.com/kadehar/allure-piechart-telegram/workflows/build-jar/badge.svg?branch=master&event=release)

<h3>Allure piechart telegram script</h3>

jar, that draws piechart from results `allure-report/widgets/summary.json` and sends it with link to build to telegram-chat

![shakal screenshot](shakal-screenshot.png)


0. Create telegram bot in @BotFather and add it to your chat.<br/>
Remember <b>telegram bot secret</b><br/>
Remember <b>telegram chat id</b>, you can find here -> https://api.telegram.org/bot{telegram_bot_secret}/getUpdates (bot needs admin rights)<br/>
1. You can download ready jar https://github.com/svasenkov/allure-piechart-telegram/blob/master/build/libs/allure-piechart-telegram-2.0.jar or clone project and build .jar yourself:
`gradle jar` -> build/libs/allure-piechart-telegram-2.0.jar
2. Put allure-piechart-telegram-2.0.jar in your in root folder of your autotests project (yes, its awful, but kiss).
3. Run it after allure-report is generated, 
for example Jenkins postbuild task (Postbuild plugin required https://plugins.jenkins.io/postbuild-task/):<br/>
`java -jar allure-piechart-telegram-2.0.jar -ch true -s telegram_bot_secret -c telegram_chat_id -p ${JOB_BASE_NAME} -f allure-report/ -b ${BUILD_URL} -n "Allure piechart telegram bot Release 2.0" -e https://qa.guru -l ru`![jenkins config](jenkins-config.png)

<h3>CommandLine options</h3>

You can run post build task using cmd options: <br/>
`-ch, --chart - Enable/disable PieChart diagram (false by default);` <br/>
`-s, --secret, --token - Set telegram bot secret token;` <br/>
`-c, --chat, --id - Set telegram chat id;` <br/>
`-p, --project - Set project name;` <br/>
`-f, --folder, --allure - Set allure report folder;` <br/>
`-b, --build, --link - Set link to build;` <br/>
`-n, --name - Set launch name;` <br/>
`-e, --env - Set environment;` <br/>
`-l, --lang - Set template language (possible values are: ru, en). English by default.` <br/>
Pay attention, all options (except `-ch` and `-l`) are required.
