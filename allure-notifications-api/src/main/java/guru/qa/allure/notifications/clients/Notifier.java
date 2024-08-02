package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;

public interface Notifier {

    void sendText(MessageData messageData) throws MessagingException;

    void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException;
}
