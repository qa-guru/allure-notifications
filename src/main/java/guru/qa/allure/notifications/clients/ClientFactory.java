package guru.qa.allure.notifications.clients;

import java.util.ArrayList;
import java.util.List;

import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.rocket.RocketClient;
import guru.qa.allure.notifications.clients.skype.SkypeClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.template.data.MessageData;

public class ClientFactory {

    public static List<Notifier> from(Config config) {
        MessageData messageData = new MessageData(config.getBase());
        if (config.getTestops() != null) {
            messageData = new MessageData(config.getBase(), config.getTestops());
        }

        List<Notifier> notifiers =  new ArrayList<>();
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
        if (config.getRocket() != null) {
            notifiers.add(new RocketClient(messageData, config.getRocket()));
        }
        return notifiers;
    }
}
