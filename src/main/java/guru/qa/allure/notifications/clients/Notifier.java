package guru.qa.allure.notifications.clients;

import guru.qa.allure.notifications.exceptions.MessagingException;

public interface Notifier {

    void sendText() throws MessagingException;

    void sendPhoto(byte[] chartImage) throws MessagingException;
}
