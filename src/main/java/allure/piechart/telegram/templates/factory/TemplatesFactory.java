package allure.piechart.telegram.templates.factory;

import allure.piechart.telegram.models.Summary;
import allure.piechart.telegram.templates.MessageTemplate;

import javax.validation.constraints.NotNull;

/**
 * Управляет созданием шаблонов сообщений.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TemplatesFactory {
    /** Возвращает сообщение на выбранном языке. */
    public static String getMessage(final @NotNull Summary summary, final @NotNull String language,
                                    final @NotNull String launchName, final @NotNull String env,
                                    final @NotNull String reportLink) {
        switch (language.toLowerCase()) {
            case "ru": return new MessageTemplate(summary).rusMessage(launchName, env, reportLink);
            case "en": return new MessageTemplate(summary).engMessage(launchName, env, reportLink);
            default:
                throw new IllegalStateException("Unexpected value: " + language.toLowerCase());
        }
    }
}
