package allure.piechart.telegram.clients;

import allure.piechart.telegram.models.Summary;
import allure.piechart.telegram.options.OptionsValues;
import allure.piechart.telegram.templates.LanguageTemplate;
import allure.piechart.telegram.templates.data.TemplateData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.constraints.NotNull;

import static allure.piechart.telegram.utils.Utils.getBuildSummary;
import static allure.piechart.telegram.utils.Utils.getTemplateData;

/**
 * Базовый клиент для отправки сообщения в чат.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class BaseClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(BaseClient.class);

    /**
     * Отправляет сообщения с пользовательскими параметрами в чат.
     *
     * @param values данные, введённые пользователем в командной строке
     */
    public static void sendMessage(final @NotNull OptionsValues values) {
        final Summary summary = getBuildSummary(values.getAllureReportFolder());
        final TemplateData data = getTemplateData(summary, values.getLaunchName(),
                values.getEnv(), values.getBuildLink());
        final String text = LanguageTemplate.buildMessage(data);
        send(values, summary, text);
    }

    private static void send(final @NotNull OptionsValues values, final @NotNull Summary summary,
                             final @NotNull String text) {
        switch (values.getMessenger().toLowerCase()) {
            case "telegram":
                LOGGER.info("Send message to telegram");
                TelegramClient.sendMessageToTelegram(values, summary, text);
                LOGGER.info("Done");
                break;
            default:
                throw new IllegalStateException("Unexpected value: " + values.getMessenger().toLowerCase());
        }
    }
}
