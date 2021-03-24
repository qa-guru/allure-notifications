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
    /** Возвращает отформатированное по шаблону сообщение. */
    public static String formattedMessage() {
        ResourceBundle message = ResourceBundle.getBundle("template/text");
        MessageFormat formatter = new MessageFormat("");
        formatter.applyPattern(message.getString("template"));
        return formatter.format(TemplateUtil.templateData());
    }
}
