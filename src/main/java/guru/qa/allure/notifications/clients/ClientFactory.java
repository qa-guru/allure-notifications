package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.clients.cliq.CliqClient;
import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.skype.SkypeClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.template.data.MessageData;

import java.util.ArrayList;
import java.util.List;

public class ClientFactory {

    public static List<Notifier> from(Config config) {
        MessageData messageData = new MessageData(config.getBase());

        List<Notifier> notifiers = new ArrayList<>();
        if (config.getTelegram() != null) {
            notifiers.add(new TelegramClient(messageData, config.getTelegram()));
        }
        if (config.getSlack() != null) {
            notifiers.add(new SlackClient(messageData, config.getSlack()));
        }
        if (config.getMail() != null) {
            notifiers.add(new Email(messageData, config.getMail()));
        }
        if (config.getMattermost() != null) {
            notifiers.add(new MattermostClient(messageData, config.getMattermost()));
        }
        if (config.getSkype() != null) {
            notifiers.add(new SkypeClient(messageData, config.getSkype()));
        }
        if (config.getCliq() != null) {
            notifiers.add(new CliqClient(messageData, config.getCliq()));
        }
        return notifiers;
    }
}
