package guru.qa.allure.notifications.exceptions;

public class MessageSendException extends MessagingException {
    public MessageSendException(String message, Throwable cause) {
        super(message, cause);
    }

    public MessageSendException(String message) {
        super(message);
    }
}
