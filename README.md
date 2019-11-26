<h3>Allure piechart telegram script</h3>

jar, that draws piechart from results `allure-report/export/prometheusData.txt` and sends it with link to build to telegram-chat

![shakal screenshot](shakal-screenshot.png)


0. Create telegram bot and add it to chat
1. You can download ready jar https://github.com/svasenkov/allure-piechart-telegram/allure-piechart-telegram-1.0.jar or clone project and build .jar yourself:
`gradle build` -> build/libs/allure-piechart-telegram-1.0.jar
2. Put allure-piechart-telegram-1.0.jar in your in root folder of your autotest project.
3. Run it after allure-report is generated, 
for example Jenkins postbuild task:
`java -jar allure-piechart-telegram-1.0.jar "telegram_chat_id_here" "bot_secret_here" "${JOB_BASE_NAME}" "allure-report/" ${BUILD_URL}`
![jenkins config](jenkins-config.png)

