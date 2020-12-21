package allure.piechart.telegram.templates.factory;

import allure.piechart.telegram.models.Summary;
import allure.piechart.telegram.templates.MessageTemplate;
import org.stringtemplate.v4.ST;

import javax.validation.constraints.NotNull;

/**
 * Управляет созданием шаблонов сообщений.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class TemplatesFactory {

    /** Возвращает сообщение на выбранном языке. */
    public static ST getMessage(final @NotNull Summary summary, final @NotNull String language,
                                final @NotNull String launchName, final @NotNull String env,
                                final @NotNull String reportLink) {
        ST template;
        switch (language.toLowerCase()) {
            case "ru":
                template = new MessageTemplate(summary).rusMessage(launchName, env, reportLink);
                template.add("bullet", '\u2022');
                template.add("asterisk", "**");
                return template;
            case "en":
                template = new MessageTemplate(summary).engMessage(launchName, env, reportLink);
                template.add("bullet", '\u2022');
                template.add("asterisk", "**");
                return template;
            default:
                throw new IllegalStateException("Unexpected value: " + language.toLowerCase());
        }
    }
}
