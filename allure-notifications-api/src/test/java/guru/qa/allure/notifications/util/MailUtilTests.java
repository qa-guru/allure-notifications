package guru.qa.allure.notifications.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import guru.qa.allure.notifications.exceptions.InvalidArgumentException;
import jakarta.mail.internet.InternetAddress;

class MailUtilTests {
    @ParameterizedTest()
    @CsvSource(delimiter = ';', value = {
            "test@gmail.com;                   1",
            "test1@gmail.com,test2@gmail.com;  2",
            "test1@gmail.com, test2@gmail.com; 2"
    })
    void shouldParseRecipients(String recipients, int numberOfMails) {
        InternetAddress[] addresses = MailUtil.recipients(recipients);
        assertEquals(addresses.length, numberOfMails);
        assertTrue(Arrays.stream(addresses).allMatch(a -> recipients.contains(a.getAddress())));
    }

    @Test
    void shouldThrowExceptionIfPassedInvalidEmail() {
        String httpsMail = "https://test@gmail.com";
        Exception exception = assertThrows(InvalidArgumentException.class, () -> MailUtil.recipients(httpsMail));
        assertEquals("Invalid email address: " + httpsMail, exception.getMessage());
    }
}
