package guru.qa.allure.notifications.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.stream.Stream;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import guru.qa.allure.notifications.config.proxy.Proxy;
import kong.unirest.Unirest;

class ProxyManagerTest {

    @BeforeEach
    @AfterEach
    void resetUnirest() {
        Unirest.shutDown();
    }

    static Stream<Arguments> proxySource() {
        return Stream.of(
                Arguments.of("proxy is null", null, false, false),
                Arguments.of(
                        "host/port only",
                        createProxy("proxy.example", 8080, null, null),
                        true,
                        false),
                Arguments.of(
                        "authenticated proxy",
                        createProxy("proxy.example", 443, "user", "secret"),
                        true,
                        true),
                Arguments.of(
                        "incomplete credentials (username only)",
                        createProxy("proxy.example", 443, "user", null),
                        true,
                        false),
                Arguments.of(
                        "port zero ignored",
                        createProxy("proxy.example", 0, "user", "secret"),
                        false,
                        false)
        );
    }

    @ParameterizedTest(name = "ProxyManager: {0}")
    @MethodSource("proxySource")
    void manageProxyConfiguresUnirest(String condition,
                                      Proxy proxy,
                                      boolean expectProxy,
                                      boolean expectAuth) {
        ProxyManager.manageProxy(proxy);

        if (!expectProxy) {
            assertNull(Unirest.config().getProxy(), condition);
            return;
        }

        assertNotNull(Unirest.config().getProxy(), condition);
        assertEquals(proxy.getHost(), Unirest.config().getProxy().getHost());
        assertEquals(proxy.getPort().intValue(), Unirest.config().getProxy().getPort());
        if (expectAuth) {
            assertEquals(proxy.getUsername(), Unirest.config().getProxy().getUsername());
            assertEquals(proxy.getPassword(), Unirest.config().getProxy().getPassword());
        }
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
