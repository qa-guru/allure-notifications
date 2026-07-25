package guru.qa.allure.notifications.clients.mail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.verify;

import java.util.function.Consumer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;

import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.mail.Mail;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.template.data.MessageData;

@ExtendWith(MockitoExtension.class)
class EmailTests {
    private static final String FROM = "testFROM@gmail.com";
    private static final String TO = "testTO@gmail.com";
    private static final String CC = "testCC@gmail.com, testCC2@gmail.com";
    private static final String BCC = "testBCC@gmail.com";
    private static final String PROJECT = "LETTER PROJECT";
    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";
    private static final String TEXT_FROM_TEMPLATE = "for test purposes";
    private static final byte[] IMG = new byte[1];

    private static final Base BASE = new Base();

    @Mock private Letter letter;
    @Mock private MessageData messageData;

    @BeforeEach
    void beforeEach() {
        BASE.setProject(PROJECT);
        lenient().when(messageData.getProject()).thenReturn(PROJECT);
    }

    private void mockLetter(Consumer<Letter> letterConsumer) {
        try (MockedConstruction<Letter> letterMock = mockConstruction(Letter.class,
                (mock, context) -> {
                    lenient().when(mock.from(FROM)).thenReturn(letter);
                    lenient().when(letter.to(TO)).thenReturn(letter);
                    lenient().when(letter.cc(CC)).thenReturn(letter);
                    lenient().when(letter.bcc(BCC)).thenReturn(letter);
                    lenient().when(letter.subject(PROJECT)).thenReturn(letter);
                    lenient().when(letter.text(anyString())).thenReturn(letter);
                    lenient().when(letter.image(IMG)).thenReturn(letter);
                })) {
            letterConsumer.accept(letter);
        }
    }

    @Test
    void shouldSendText() {
        Mail mail = createMailWithoutRecipient();
        mail.setTo(TO);

        mockLetter(l -> {
            Email email = new Email(mail);
            try {
                email.sendText(messageData);
                verify(l).to(TO);
                verify(l).cc(CC);
                verify(l).bcc(BCC);
                verify(l).subject(PROJECT);
                verify(l).text(TEXT_FROM_TEMPLATE);
                verify(l).send();
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void shouldSendTextWithDeprecatedRecipientField() {
        Mail mail = createMailWithoutRecipient();
        mail.setRecipient(TO);

        mockLetter(l -> {
            Email email = new Email(mail);
            try {
                email.sendText(messageData);
                verify(l).to(TO);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    void shouldThrowExceptionIfAmbiguousRecipientFieldsUsing() {
        Mail mail = createMailWithoutRecipient();
        mail.setRecipient(TO);
        mail.setTo(TO);

        mockLetter(l -> {
            Email email = new Email(mail);
            Exception exception = assertThrows(IllegalArgumentException.class, () -> email.sendText(messageData));
            assertEquals("Ambiguous configuration fields \"recipient\" and \"to\" found, "
                    + "use only \"to\" field instead.", exception.getMessage());
        });
    }

    @Test
    void shouldSendTextWithChart() {
        Mail mail = createMailWithoutRecipient();
        mail.setTo(TO);

        mockLetter(l -> {
            Email email = new Email(mail);
            try {
                email.sendPhoto(messageData, IMG);
                verify(l).to(TO);
                verify(l).cc(CC);
                verify(l).bcc(BCC);
                verify(l).subject(PROJECT);
                verify(l).text("<img src='cid:image'/><br/>" + TEXT_FROM_TEMPLATE);
                verify(l).image(IMG);
                verify(l).send();
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    private Mail createMailWithoutRecipient() {
        Mail mail = new Mail();
        mail.setTemplatePath(EMPTY_TEMPLATE_PATH);
        mail.setFrom(FROM);
        mail.setCc(CC);
        mail.setBcc(BCC);
        return mail;
    }
}
