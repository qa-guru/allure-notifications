package allure.notifications.bot;

import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;

import javax.validation.constraints.NotNull;

/**
 * Стандартный контракт для ботов.
 *
 * @author kadehar
 * @since 2.0.1
 */
public interface AllureBot {
    void sendPhotoToChat(final @NotNull SendPhoto photo);
    void sendTextMessage(final @NotNull SendMessage message);
}
