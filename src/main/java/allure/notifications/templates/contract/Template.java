package allure.notifications.templates.contract;

import allure.notifications.templates.data.TemplateData;
import org.stringtemplate.v4.ST;

import javax.validation.constraints.NotNull;

/**
 * Контракт для разработки шаблонов сообщений.
 *
 * @author kadehar
 * @since 2.0.2
 */
public interface Template {
    ST message(final @NotNull TemplateData data);
}
