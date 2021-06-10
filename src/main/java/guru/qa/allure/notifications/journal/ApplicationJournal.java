package guru.qa.allure.notifications.journal;

import guru.qa.allure.notifications.config.helpers.Base;
import guru.qa.allure.notifications.config.helpers.Bot;
import guru.qa.allure.notifications.config.helpers.Build;
import guru.qa.allure.notifications.config.helpers.Mail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ApplicationJournal {
    private static final Logger LOG = LoggerFactory.getLogger("Journal");

    public static void buildInfo() {
        LOG.info(
                "\n========BUILD INFO========"
                        + "\nJOB: {}"
                        + "\nENV: {}"
                        + "\nREPORT LINK: {}",
                Build.job(), Build.env(), Build.reportLink());
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
                        + "\nMATTERMOST URL: {}",
                Base.lang(), Base.messenger(), Base.allureFolder(), Base.mattermostUrl());
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
}
