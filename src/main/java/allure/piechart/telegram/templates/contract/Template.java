package allure.piechart.telegram.templates.contract;

import allure.piechart.telegram.templates.data.TemplateData;
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
