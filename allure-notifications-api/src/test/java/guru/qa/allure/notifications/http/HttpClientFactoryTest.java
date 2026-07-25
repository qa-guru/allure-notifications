package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    @ParameterizedTest(name = "resolveProxyScheme: {0}")
    @MethodSource("proxySchemeCases")
    void resolveProxyScheme(String testName, Proxy proxy, String expectedScheme) {
        assertEquals(expectedScheme, HttpClientFactory.resolveProxyScheme(proxy));
    }

    private static Stream<Arguments> proxyConfigurations() {
        return Stream.of(
            Arguments.of(
                "No proxy configuration",
                null
            ),
            Arguments.of(
                "HTTP proxy with host and port only",
                createProxy("http", "proxy.example.com", 8080, null, null)
            ),
            Arguments.of(
                "HTTP proxy with authentication",
                createProxy("http", "proxy.example.com", 8080, "user", "password")
            ),
            Arguments.of(
                "SOCKS5 proxy without authentication",
                createProxy("socks5", "proxy.qaguru.school", 7777, null, null)
            ),
            Arguments.of(
                "Default type is HTTP when type omitted",
                createProxy(null, "proxy.example.com", 8080, null, null)
            ),
            Arguments.of(
                "Proxy with incomplete configuration",
                createProxy(null, null, null, null, null)
            )
        );
    }

    private static Stream<Arguments> proxySchemeCases() {
        return Stream.of(
            Arguments.of("null proxy defaults to http", null, "http"),
            Arguments.of("http type", createProxy("http", "host", 8080, null, null), "http"),
            Arguments.of("blank type defaults to http", createProxy("  ", "host", 8080, null, null), "http"),
            Arguments.of("socks5 type", createProxy("socks5", "host", 7777, null, null), "socks"),
            Arguments.of("socks alias", createProxy("socks", "host", 7777, null, null), "socks")
        );
    }

    private static Proxy createProxy(String type, String host, Integer port, String username, String password) {
        Proxy proxy = new Proxy();
        proxy.setType(type);
        proxy.setHost(host);
        proxy.setPort(port);
        proxy.setUsername(username);
        proxy.setPassword(password);
        return proxy;
    }
}
