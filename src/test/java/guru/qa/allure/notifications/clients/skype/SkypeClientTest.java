package guru.qa.allure.notifications.clients.skype;

import guru.qa.allure.notifications.config.skype.Skype;
import guru.qa.allure.notifications.template.data.MessageData;

import org.apache.commons.lang3.reflect.MethodUtils;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SkypeClientTest {
    @Mock Skype skype = mock(Skype.class);

    @InjectMocks
    private SkypeClient app = new SkypeClient(mock(MessageData.class), skype);

    @ParameterizedTest(name = "Get host name from service url: {0}")
    @CsvSource({
            "smba.trafficmanager.net/apis/,smba.trafficmanager.net",
            "smba.net/apis/,smba.net",
            "smba.trafficmanager.net/,smba.trafficmanager.net",
            "smba.trafficmanager.net,smba.trafficmanager.net",

    })
    void hostTest(String url, String expected) throws ReflectiveOperationException {
        Mockito.when(skype.getServiceUrl()).thenReturn(url);
        assertEquals(expected, MethodUtils.invokeMethod(app, true, "host"));
    }
}