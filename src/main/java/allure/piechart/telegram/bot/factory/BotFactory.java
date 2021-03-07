package allure.piechart.telegram.bot.factory;

import allure.piechart.telegram.bot.AllureBot;
import allure.piechart.telegram.bot.TelegramBot;
import allure.piechart.telegram.options.OptionsValues;

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
     * @return бот для отправки сообщений
     */
    public static TelegramBot createTelegramBot() {
        return new TelegramBot();
    }

    public static AllureBot getBot(final @NotNull OptionsValues values) {
        switch (values.getMessenger().toLowerCase()) {
            case "telegram": return new TelegramBot();
            default:
                throw new IllegalStateException("Unexpected value: " + values.getMessenger().toLowerCase());
        }
    }
}
