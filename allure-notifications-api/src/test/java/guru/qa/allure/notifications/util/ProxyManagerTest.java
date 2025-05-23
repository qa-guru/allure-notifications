package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.proxy.Proxy;
import kong.unirest.Config;
import kong.unirest.Unirest;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;

import java.util.UUID;
import java.util.stream.Stream;

@Disabled
class ProxyManagerTest {

    public static Stream<Arguments> proxySource() {
        return Stream.of(
                Arguments.of(
                        "proxy is null",
                        null,
                        0,
                        0
                ),
                Arguments.of(
                        "username is null",
                        createProxyConfig(
                                UUID.randomUUID().toString(),
                                443,
                                null,
                                UUID.randomUUID().toString()
                        ),
                        1,
                        0
                ),
                Arguments.of(
                        "password is null",
                        createProxyConfig(
                                UUID.randomUUID().toString(),
                                443,
                                UUID.randomUUID().toString(),
                                null
                        ),
                        1,
                        0
                ),
                Arguments.of(
                        "is proxy",
                        createProxyConfig(
                                UUID.randomUUID().toString(),
                                443,
                                UUID.randomUUID().toString(),
                                UUID.randomUUID().toString()
                        ),
                        0,
                        1
                )
        );
    }

    private static Proxy createProxyConfig(String host, Integer port, String username, String password) {
        Proxy proxy = new Proxy();
        proxy.setHost(host);
        proxy.setPort(port);
        proxy.setUsername(username);
        proxy.setPassword(password);
        return proxy;
    }

    @ParameterizedTest(name = "ProxyManager: {0}")
    @MethodSource("proxySource")
    void manageProxyProxyIsNullTest(String condition, Proxy proxy, Integer notProxyTimes, Integer withProxyTimes) {
        Config config = Mockito.mock(Config.class);
        Unirest unirest = Mockito.mock(Unirest.class);
        ProxyManager.manageProxy(proxy);
//        Mockito.verify(unirest, Mockito.times(1));

        Mockito.verify(config, Mockito.times(withProxyTimes))
                .proxy(Mockito.anyString(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyString());
        Mockito.verify(config, Mockito.times(notProxyTimes))
                .proxy(Mockito.anyString(), Mockito.anyInt());
    }
}
