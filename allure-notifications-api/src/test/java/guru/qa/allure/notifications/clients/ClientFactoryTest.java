package guru.qa.allure.notifications.clients;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import guru.qa.allure.notifications.clients.cliq.CliqClient;
import guru.qa.allure.notifications.clients.discord.DiscordClient;
import guru.qa.allure.notifications.clients.loop.LoopClient;
import guru.qa.allure.notifications.clients.mail.Email;
import guru.qa.allure.notifications.clients.mattermost.MattermostClient;
import guru.qa.allure.notifications.clients.rocket.RocketChatClient;
import guru.qa.allure.notifications.clients.slack.SlackClient;
import guru.qa.allure.notifications.clients.teams.TeamsClient;
import guru.qa.allure.notifications.clients.telegram.TelegramClient;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.config.discord.Discord;
import guru.qa.allure.notifications.config.loop.Loop;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.config.mattermost.Mattermost;
import guru.qa.allure.notifications.config.rocket.RocketChat;
import guru.qa.allure.notifications.config.slack.Slack;
import guru.qa.allure.notifications.config.teams.Teams;
import guru.qa.allure.notifications.config.telegram.Telegram;

class ClientFactoryTest {

    @Test
    void returnsEmptyListWhenNoMessengersConfigured() {
        Config config = baseConfig();
        assertTrue(ClientFactory.from(config).isEmpty());
    }

    @Test
    void createsAllConfiguredClientsInStableOrder() {
        Config config = baseConfig();
        config.setTelegram(new Telegram());
        config.setSlack(new Slack());
        Mail mail = new Mail();
        mail.setHost("smtp.example");
        mail.setPort("587");
        mail.setFrom("noreply@example.com");
        config.setMail(mail);
        config.setMattermost(new Mattermost());
        config.setDiscord(new Discord());
        config.setLoop(new Loop());
        config.setRocketChat(new RocketChat());
        config.setCliq(new Cliq());
        config.setTeams(new Teams());

        List<Notifier> notifiers = ClientFactory.from(config);

        assertEquals(9, notifiers.size());
        assertInstanceOf(TelegramClient.class, notifiers.get(0));
        assertInstanceOf(SlackClient.class, notifiers.get(1));
        assertInstanceOf(Email.class, notifiers.get(2));
        assertInstanceOf(MattermostClient.class, notifiers.get(3));
        assertInstanceOf(DiscordClient.class, notifiers.get(4));
        assertInstanceOf(LoopClient.class, notifiers.get(5));
        assertInstanceOf(RocketChatClient.class, notifiers.get(6));
        assertInstanceOf(CliqClient.class, notifiers.get(7));
        assertInstanceOf(TeamsClient.class, notifiers.get(8));
    }

    @Test
    void createsOnlyTelegramWhenOnlyTelegramConfigured() {
        Config config = baseConfig();
        config.setTelegram(new Telegram());

        List<Notifier> notifiers = ClientFactory.from(config);

        assertEquals(1, notifiers.size());
        assertInstanceOf(TelegramClient.class, notifiers.get(0));
    }

    private static Config baseConfig() {
        Config config = new Config();
        config.setBase(new Base());
        return config;
    }
}
