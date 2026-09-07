package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.proxy.Proxy;
import guru.qa.allure.notifications.http.HttpClientFactory;
import kong.unirest.Unirest;
import kong.unirest.apache.ApacheClient;
import org.apache.commons.lang3.StringUtils;

public class ProxyManager {
    public static void manageProxy(Proxy proxy) {
        if (!HttpClientFactory.isConfigured(proxy)) {
            return;
        }
        Proxy resolved = HttpClientFactory.withResolvedCredentials(proxy);
        if (resolved.isSocks()) {
            // Unirest.config().proxy() is HTTP CONNECT only. SOCKS5 needs the Apache client
            // with Socks5Tunnel (RFC 1928 + optional RFC 1929).
            Unirest.config().httpClient(new ApacheClient(
                    HttpClientFactory.createHttpClient(resolved), Unirest.config()));
            return;
        }
        if (StringUtils.isNotEmpty(resolved.getUsername()) && StringUtils.isNotEmpty(resolved.getPassword())) {
            Unirest.config().proxy(resolved.getHost(), resolved.getPort(),
                    resolved.getUsername(), resolved.getPassword());
        } else {
            Unirest.config().proxy(resolved.getHost(), resolved.getPort());
        }
    }
}
