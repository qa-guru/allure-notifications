package guru.qa.allure.notifications.journal;

import guru.qa.allure.notifications.config.helpers.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ApplicationJournal {
    private static final Logger LOG = LoggerFactory.getLogger("Journal");

    public static void buildInfo() {
        LOG.info(
                "\n========BUILD INFO========"
                        + "\nPROJECT: {}"
                        + "\nENV: {}"
                        + "\nREPORT LINK: {}",
                Build.projectName(), Build.env(), Build.reportLink());
    }

    public static void botInfo() {
        LOG.info(
                "\n========BOT INFO========"
                        + "\nTOKEN: {}"
                        + "\nCHAT: {}"
                        + "\nREPLY TO: {}",
                Bot.token(), Bot.chat(), Bot.replyTo());
    }

    public static void baseInfo() {
        LOG.info(
                "\n========BASE INFO========"
                        + "\nLANG: {}"
                        + "\nMESSENGER: {}"
                        + "\nALLURE FOLDER: {}"
                        + "\nMATTERMOST URL: {}"
                        + "\nIS CHART ENABLED: {}"
                        + "\nCHART NAME: {}",
                Base.lang(), Base.messenger(), Base.allureFolder(),
                Base.mattermostUrl(), Base.isChartEnabled(), Base.chartName());
    }

    public static void mailInfo() {
        LOG.info(
                "\n========MAIL INFO========"
                        + "\nHOST: {}"
                        + "\nPORT: {}"
                        + "\nENABLE SSL: {}"
                        + "\nFROM: {}"
                        + "\nTO: {}",
                Mail.host(), Mail.port(), Mail.enableSSL(), Mail.from(), Mail.recipient());
    }

    public static void proxyInfo() {
        LOG.info(
                "\n========PROXY INFO========"
                        + "\nHOST: {}"
                        + "\nPORT: {}"
                        + "\nUSERNAME: {}"
                        + "\nPASSWORD: {}",
                Proxy.host(), Proxy.port(), Proxy.username(), Proxy.password());
    }

    public static void skypeInfo() {
        LOG.info(
                "\n========SKYPE INFO========"
                        + "\nAPP ID: {}"
                        + "\nAPP SECRET: {}"
                        + "\nSERVICE URL: {}"
                        + "\nCONVERSATION ID: {}"
                        + "\nBOT ID: {}"
                        + "\nBOT NAME: {}",
                SkypeSettings.appId(),
                SkypeSettings.appSecret(),
                SkypeSettings.serviceUrl(),
                SkypeSettings.conversationId(),
                SkypeSettings.botId(),
                SkypeSettings.botName());
    }
}
