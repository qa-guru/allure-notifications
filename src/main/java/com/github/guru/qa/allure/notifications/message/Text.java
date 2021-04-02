package com.github.guru.qa.allure.notifications.message;

import com.github.guru.qa.allure.notifications.utils.TemplateUtil;

import java.text.MessageFormat;
import java.util.ResourceBundle;

/**
 * Создаёт отформатированный текст сообщения.
 *
 * @author kadehar
 * @since 2.0.10
 */
public class Text {
    /** Возвращает отформатированное по шаблону сообщение в Markdown формате. */
    public static String formattedMarkdownMessage() {
        ResourceBundle message = ResourceBundle.getBundle("template/text");
        MessageFormat formatter = new MessageFormat("");
        formatter.applyPattern(message.getString("markdown"));
        return formatter.format(TemplateUtil.templateData());
    }

    /** Возвращает отформатированное по шаблону сообщение в HTML формате. */
    public static String formattedHtmlMessage() {
        ResourceBundle message = ResourceBundle.getBundle("template/text");
        MessageFormat formatter = new MessageFormat("");
        formatter.applyPattern(message.getString("html"));
        return formatter.format(TemplateUtil.templateData())
                .replaceAll("bold", "<b>")
                .replaceAll("poly", "</b>")
                .replaceAll("nop", "<br>");
    }
}
