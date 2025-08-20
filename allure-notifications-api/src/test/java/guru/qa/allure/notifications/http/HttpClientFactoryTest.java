package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class HttpClientFactoryTest {

    @ParameterizedTest(name = "{0}")
    @MethodSource("proxyConfigurations")
    void testCreateHttpClient(String testName, Proxy proxy) {
        CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy);
        assertNotNull(client);
        assertInstanceOf(CloseableHttpClient.class, client);
    }

    private static Stream<Arguments> proxyConfigurations() {
        return Stream.of(
            Arguments.of(
                "No proxy configuration",
                null
            ),
            Arguments.of(
                "Proxy with host and port only",
                createProxy("proxy.example.com", 8080, null, null)
            ),
            Arguments.of(
                "Proxy with authentication",
                createProxy("proxy.example.com", 8080, "user", "password")
            ),
            Arguments.of(
                "Proxy with incomplete configuration",
                createProxy(null, null, null, null)
            )
        );
    }

    private static Proxy createProxy(String host, Integer port, String username, String password) {
        Proxy proxy = new Proxy();
        proxy.setHost(host);
        proxy.setPort(port);
        proxy.setUsername(username);
        proxy.setPassword(password);
        return proxy;
    }
}
