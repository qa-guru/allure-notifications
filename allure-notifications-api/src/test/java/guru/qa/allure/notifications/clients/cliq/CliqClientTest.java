package guru.qa.allure.notifications.clients.cliq;

import org.apache.commons.lang3.reflect.MethodUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.mockito.junit.jupiter.MockitoExtension;

import guru.qa.allure.notifications.config.cliq.Cliq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class CliqClientTest {

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
        CliqClient cliqClient = new CliqClient(createCliqConfig(dataCenter), null);
        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        String expectedUrl = String.format("https://%s/api/v2/channelsbyname/test-chat/message?zapikey=test-token", expectedDomain);
        assertEquals(expectedUrl, url);
    }
    
    @Test
    void testUnsupportedDataCenterThrowsException() {
        CliqClient cliqClient = new CliqClient(createCliqConfig("ch"), null);

        Exception exception = assertThrows(Exception.class, () -> 
            MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message"));

        assertInstanceOf(IllegalArgumentException.class, exception.getCause());
        assertTrue(exception.getCause().getMessage().contains("Unsupported data center: ch"));
    }

    @Test
    void testUrlGenerationWithBot() throws ReflectiveOperationException {
        Cliq cliqConfig = createCliqConfig();
        cliqConfig.setBot("testbot");

        CliqClient cliqClient = new CliqClient(cliqConfig, null);

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        assertEquals("https://cliq.zoho.eu/api/v2/channelsbyname/test-chat/message?"
                + "zapikey=test-token&bot_unique_name=testbot", url);
    }

    @ParameterizedTest
    @NullAndEmptySource
    void testUrlGenerationWithoutBot(String bot) throws ReflectiveOperationException {
        Cliq cliqConfig = createCliqConfig();
        cliqConfig.setBot(bot);

        CliqClient cliqClient = new CliqClient(cliqConfig, null);

        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", "message");

        assertEquals("https://cliq.zoho.eu/api/v2/channelsbyname/test-chat/message?zapikey=test-token", url);
    }

    @ParameterizedTest(name = "Generate URL for endpoint type: {0}")
    @CsvSource({
            "message,message",
            "files,files"
    })
    void testUrlGenerationForDifferentEndpoints(String endpointType, String expectedType) 
            throws ReflectiveOperationException {
        Cliq cliqConfig = createCliqConfig();

        CliqClient cliqClient = new CliqClient(cliqConfig, null);
        String url = (String) MethodUtils.invokeMethod(cliqClient, true, "generateUrl", endpointType);

        assertTrue(url.contains("/" + expectedType + "?"));
    }

    @Test
    void testCliqClientCreation() {
        Cliq config = createCliqConfig();
        CliqClient client = new CliqClient(config, null);
        assertInstanceOf(CliqClient.class, client);
    }

    private static Cliq createCliqConfig() {
        return createCliqConfig("eu");
    }

    private static Cliq createCliqConfig(String dataCenter) {
        Cliq cliq = new Cliq();
        cliq.setToken("test-token");
        cliq.setChat("test-chat");
        cliq.setDataCenter(dataCenter);
        cliq.setTemplatePath("/template/emptyTemplate.ftl");
        return cliq;
    }
}
