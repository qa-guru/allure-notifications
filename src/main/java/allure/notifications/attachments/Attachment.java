package allure.notifications.attachments;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import javax.validation.constraints.NotNull;
import java.io.File;

/**
 * Отвечает за создание вложений для ботов.
 *
 * @author kadehar
 * @since 2.0.1
 */
public class Attachment {
    private static final Logger LOGGER = LoggerFactory.getLogger(Attachment.class);

    /**
     * Создаёт картинку в формате png для отправки в чат.
     * @param fileName имя файла
     * @param caption описание
     * @param chatId идентификатор чата
     * @return фотография с описанием
     */
    public static SendPhoto photo(final @NotNull String fileName, final @NotNull String caption,
                                  final @NotNull String chatId) {
        LOGGER.info("Photo:\n- Name: {}\n- Caption: \n{}\n- Chat ID: {}", fileName, caption, chatId);
        final SendPhoto attachment = new SendPhoto();
        attachment.setPhoto(new File(fileName + ".png"));
        attachment.setCaption(caption);
        attachment.setChatId(chatId);
        return attachment;
    }

    /**
     * Создаёт текстовое сообщение для отправки в чат.
     * @param msg текст сообщения
     * @param chatId идентификатор чата
     * @return текстовое сообщение
     */
    public static SendMessage textMessage(final @NotNull String msg, final @NotNull String chatId) {
        LOGGER.info("Message:\n- Text: \n{}\n- Chat ID: {}", msg, chatId);
        SendMessage message = new SendMessage();
        message.setText(msg);
        message.setChatId(chatId);
        return message;
    }
}
