FROM gradle:4.7.0-jdk8-alpine AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build --no-daemon 

FROM openjdk:8-jre-slim

EXPOSE 8080

RUN mkdir /app

COPY --from=build /home/gradle/src/build/libs/*.jar /app/spring-boot-application.jar

ENTRYPOINT java  \
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
"-jar" "/app/spring-boot-application.jar"
