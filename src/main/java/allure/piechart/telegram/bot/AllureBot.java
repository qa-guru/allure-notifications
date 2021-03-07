package allure.piechart.telegram.bot;

import allure.piechart.telegram.options.OptionsValues;

import javax.validation.constraints.NotNull;

/**
 * Стандартный контракт для ботов.
 *
 * @author kadehar
 * @since 2.0.1
 */
public interface AllureBot {
    void sendPhotoToChat(final @NotNull String message, final @NotNull OptionsValues values);
    void sendTextMessage(final @NotNull String message, final @NotNull OptionsValues values);
}
