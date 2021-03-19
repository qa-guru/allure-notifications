package com.github.guru.qa.allure.notifications.message;

import com.github.guru.qa.allure.notifications.utils.StringUtils;
import com.github.guru.qa.allure.notifications.utils.TemplateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.MessageFormat;
import java.util.ResourceBundle;

/**
 * Создаёт отформатированный текст сообщения.
 *
 * @author kadehar
 * @since 2.0.10
 */
public class Text {
    public static final Logger LOGGER = LoggerFactory.getLogger(Text.class);

    /** Возвращает отформатированное по шаблону сообщение. */
    public static String formattedMessage() {
        ResourceBundle message = ResourceBundle.getBundle("templates/message");
        MessageFormat formatter = new MessageFormat("");
        formatter.applyPattern(message.getString("template"));
        String output = formatter.format(TemplateUtil.templateData());
        LOGGER.info("Formatted message:\n{}", output);
        return StringUtils.convertToUTF8(output);
    }
}
