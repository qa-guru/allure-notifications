package allure.piechart.telegram.templates.factory;

import allure.piechart.telegram.templates.data.TemplateData;
import allure.piechart.telegram.templates.messenger.Telegram;

/**
 * Управляет созданием шаблонов сообщений.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TemplatesFactory {
    /** Возвращает отформатированное сообщение на выбранном языке. */
    public static String formattedMessage(final String messenger, final String lang, final TemplateData data) {
        switch (messenger.toLowerCase()) {
            case "telegram":
                return Telegram.tgMessage(lang, data);
            default:
                throw new IllegalStateException("Unexpected value: " + messenger.toLowerCase());
        }
    }
}
