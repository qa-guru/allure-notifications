package guru.qa.allure.notifications.clients.mail;

import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;
import static jakarta.mail.Message.RecipientType;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.function.Consumer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;

import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessageBuildException;
import guru.qa.allure.notifications.util.MailUtil;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class LetterTests {
    private static final String CC = "testCC1@gmail.com, testCC2@gmail.com";
    private static final String BCC = "testBCC@gmail.com";

    private final Mail mail = new Mail();
    private Letter letter;

    @BeforeEach
    void beforeEach() {
        mail.setFrom("from");
        mail.setHost("host");
        mail.setPort("port");
    }

    private void mockMessage(Consumer<Message> messageConsumer) {
        try (MockedConstruction<MimeMessage> messageMock = mockConstruction(MimeMessage.class)) {
            letter = new Letter(mail);
            Message message = messageMock.constructed().get(0);
            messageConsumer.accept(message);
        }
    }

    @Test
    void shouldSetCcBccIfPresent() {
        mockMessage(m -> {
            try {
                letter.cc(CC);
                letter.bcc(BCC);
                verify(m).setRecipients(RecipientType.CC, MailUtil.recipients(CC));
                verify(m).setRecipients(RecipientType.BCC, MailUtil.recipients(BCC));
            } catch (MessagingException | MessageBuildException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @ParameterizedTest
    @NullAndEmptySource
    void shouldNotSetCcBccIfNotPresent(String value) {
        mockMessage(m -> {
            try {
                letter.bcc(value);
                letter.cc(value);
            } catch (MessageBuildException e) {
                throw new RuntimeException(e);
            }
            verifyNoInteractions(m);
        });
    }
}
