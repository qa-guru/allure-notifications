package guru.qa.allure.notifications.clients.cliq;

import guru.qa.allure.notifications.config.cliq.Cliq;
import guru.qa.allure.notifications.template.data.MessageData;
import org.apache.commons.lang3.reflect.MethodUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class CliqClientTest {

    private static final String EMPTY_TEMPLATE_PATH = "/template/emptyTemplate.ftl";

    @Mock
    private Cliq cliq;
    
    @InjectMocks
    private CliqClient cliqClient;

    @ParameterizedTest(name = "Generate URL for data center: {0}")
    @CsvSource({
            "com,cliq.zoho.com",
            "eu,cliq.zoho.eu", 
            "in,cliq.zoho.in",
            "au,cliq.zoho.com.au",
            "jp,cliq.zoho.jp",
            "ca,cliq.zohocloud.ca"
    })
    void testDataCenterUrlGeneration(String dataCenter, String expectedDomain) throws ReflectiveOperationException {
        Mockito.when(cliq.getDataCenter()).thenReturn(dataCenter);
        Mockito.when(cliq.getChat()).thenReturn("testchat");
        Mockito.when(cliq.getToken()).thenReturn("testtoken");
        Mockito.when(cliq.getBot()).thenReturn("");

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        String expectedUrl = String.format("https://%s/api/v2/channelsbyname/testchat/message?zapikey=testtoken", expectedDomain);
        assertEquals(expectedUrl, url);
    }
    
    @Test
    void testUnsupportedDataCenterThrowsException() {
        Cliq testCliq = new Cliq();
        testCliq.setDataCenter("unknown");
        testCliq.setChat("testchat");
        testCliq.setToken("testtoken");
        testCliq.setBot("");
        
        CliqClient testClient = new CliqClient(testCliq);

        Exception exception = assertThrows(Exception.class, () -> 
            MethodUtils.invokeMethod(testClient, true, "generateUrl", "message"));

        assertInstanceOf(IllegalArgumentException.class, exception.getCause());
        assertTrue(exception.getCause().getMessage().contains("Unsupported data center: unknown"));
    }

    @Test
    void testUrlGenerationWithBot() throws ReflectiveOperationException {
        Mockito.when(cliq.getDataCenter()).thenReturn("eu");
        Mockito.when(cliq.getChat()).thenReturn("testchat");
        Mockito.when(cliq.getToken()).thenReturn("testtoken");
        Mockito.when(cliq.getBot()).thenReturn("testbot");

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        String expectedUrl = "https://cliq.zoho.eu/api/v2/channelsbyname/testchat/message?"
                + "zapikey=testtoken&bot_unique_name=testbot";
        assertEquals(expectedUrl, url);
    }

    @Test
    void testUrlGenerationWithoutBot() throws ReflectiveOperationException {
        Mockito.when(cliq.getDataCenter()).thenReturn("eu");
        Mockito.when(cliq.getChat()).thenReturn("testchat");
        Mockito.when(cliq.getToken()).thenReturn("testtoken");
        Mockito.when(cliq.getBot()).thenReturn("");

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        String expectedUrl = "https://cliq.zoho.eu/api/v2/channelsbyname/testchat/message?zapikey=testtoken";
        assertEquals(expectedUrl, url);
    }

    @Test
    void testUrlGenerationWithNullBot() throws ReflectiveOperationException {
        Mockito.when(cliq.getDataCenter()).thenReturn("eu");
        Mockito.when(cliq.getChat()).thenReturn("testchat");
        Mockito.when(cliq.getToken()).thenReturn("testtoken");
        Mockito.when(cliq.getBot()).thenReturn(null);

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        String expectedUrl = "https://cliq.zoho.eu/api/v2/channelsbyname/testchat/message?zapikey=testtoken";
        assertEquals(expectedUrl, url);
    }

    @ParameterizedTest(name = "Generate URL for endpoint type: {0}")
    @CsvSource({
            "message,message",
            "files,files"
    })
    void testUrlGenerationForDifferentEndpoints(String endpointType, String expectedType) 
            throws ReflectiveOperationException {
        Mockito.when(cliq.getDataCenter()).thenReturn("eu");
        Mockito.when(cliq.getChat()).thenReturn("testchat");
        Mockito.when(cliq.getToken()).thenReturn("testtoken");
        Mockito.when(cliq.getBot()).thenReturn("");

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", endpointType);

        assertTrue(url.contains("/" + expectedType + "?"));
    }

    @Test
    void testCliqClientCreation() {
        Cliq config = createCliqConfig();

        CliqClient client = new CliqClient(config);

        assertInstanceOf(CliqClient.class, client);
    }

    @Test
    void testSendTextWithNullConfig() {
        CliqClient client = new CliqClient(null);
        MessageData messageData = Mockito.mock(MessageData.class);

        assertThrows(Exception.class, () -> client.sendText(messageData));
    }

    @Test
    void testSendPhotoWithNullConfig() {
        CliqClient client = new CliqClient(null);
        MessageData messageData = Mockito.mock(MessageData.class);
        byte[] chartImage = new byte[0];

        assertThrows(Exception.class, () -> client.sendPhoto(messageData, chartImage));
    }

    private static Cliq createCliqConfig() {
        Cliq cliq = new Cliq();
        cliq.setToken("test-token");
        cliq.setChat("test-chat");
        cliq.setBot("test-bot");
        cliq.setDataCenter("eu");
        cliq.setTemplatePath(EMPTY_TEMPLATE_PATH);
        return cliq;
    }
}
