package allure.piechart.telegram.bot.factory;

import allure.piechart.telegram.bot.AllureBot;
import allure.piechart.telegram.bot.TelegramBot;

import javax.validation.constraints.NotNull;

/**
 * Отвечает за инициализацию ботов.
 *
 * @author kadehar
 * @since 2.0
 */
public class BotFactory {
    /**
     * Создаёт бота для отправки сообщений в telegram.
     *
     * @param token токен бота
     * @return бот для отправки сообщений
     */
    public static TelegramBot createTelegramBot(final @NotNull String token) {
        return new TelegramBot(token);
    }

    public static AllureBot getBot(final @NotNull String token, final @NotNull String messenger) {
        switch (messenger.toLowerCase()) {
            case "telegram": return new TelegramBot(token);
            case "slack": return new SlackBot(token);
            default:
                throw new IllegalStateException("Unexpected value: " + messenger.toLowerCase());
        }
    }
}
