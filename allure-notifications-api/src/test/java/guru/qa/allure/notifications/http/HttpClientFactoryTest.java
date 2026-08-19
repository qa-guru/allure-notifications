package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsServer;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.Test;

import javax.net.ssl.SSLContext;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HttpClientFactoryTest {

    @Test
    void createHttpClientWithoutProxy() {
        CloseableHttpClient client = HttpClientFactory.createHttpClient(null);
        assertNotNull(client);
        assertInstanceOf(CloseableHttpClient.class, client);
    }

    @Test
    void incompleteProxyIsIgnored() {
        Proxy proxy = new Proxy();
        proxy.setType("socks5");
        assertFalse(HttpClientFactory.isConfigured(proxy));
        assertNotNull(HttpClientFactory.createHttpClient(proxy));
    }

    @Test
    void httpTypeCreatesClient() {
        Proxy proxy = new Proxy();
        proxy.setType("http");
        proxy.setHost("127.0.0.1");
        proxy.setPort(8080);
        proxy.setUsername("u");
        proxy.setPassword("p");
        assertNotNull(HttpClientFactory.createHttpClient(proxy));
    }

    @Test
    void socksHandshakeFailsAgainstPlainHttp() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try {
            Proxy proxy = socksProxy(http.getAddress().getPort(), null, null);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                String url = "http://127.0.0.1:" + http.getAddress().getPort() + "/ping";
                assertThrows(Exception.class, () -> client.execute(new HttpGet(url)));
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksGetGoesThroughTunnel() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.noAuth()) {
            Proxy proxy = socksProxy(socks.port(), null, null);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                String url = "http://127.0.0.1:" + http.getAddress().getPort() + "/ping";
                try (CloseableHttpResponse response = client.execute(new HttpGet(url))) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                    assertEquals("pong", EntityUtils.toString(response.getEntity(), StandardCharsets.US_ASCII));
                }
            }
            assertTrue(socks.connectCount() >= 1);
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksHttpsGetGoesThroughTunnel() throws Exception {
        SSLContext sslContext = Socks5TestProxy.testSslContext();
        HttpsServer https = Socks5TestProxy.startHttpsEcho(sslContext);
        try (Socks5TestProxy socks = Socks5TestProxy.noAuth()) {
            Proxy proxy = socksProxy(socks.port(), null, null);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy, sslContext)) {
                String url = "https://127.0.0.1:" + https.getAddress().getPort() + "/ping";
                try (CloseableHttpResponse response = client.execute(new HttpGet(url))) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                    assertEquals("pong", EntityUtils.toString(response.getEntity(), StandardCharsets.US_ASCII));
                }
            }
        } finally {
            https.stop(0);
        }
    }

    @Test
    void socksMultipartKeepsPhotoPart() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.noAuth()) {
            Proxy proxy = socksProxy(socks.port(), null, null);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                HttpPost post = new HttpPost("http://127.0.0.1:" + http.getAddress().getPort() + "/photo");
                post.setEntity(MultipartEntityBuilder.create()
                        .setMode(HttpMultipartMode.BROWSER_COMPATIBLE)
                        .addBinaryBody("photo", new byte[] {1, 2, 3, 4}, ContentType.IMAGE_PNG, "chart.png")
                        .addTextBody("caption", "hello", ContentType.TEXT_PLAIN)
                        .build());
                try (CloseableHttpResponse response = client.execute(post)) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                    assertEquals("ok", EntityUtils.toString(response.getEntity(), StandardCharsets.US_ASCII));
                }
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksUsernamePassword() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.withPassword("alice", "secret")) {
            Proxy proxy = socksProxy(socks.port(), "alice", "secret");
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                String url = "http://127.0.0.1:" + http.getAddress().getPort() + "/ping";
                try (CloseableHttpResponse response = client.execute(new HttpGet(url))) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                }
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksWrongPasswordFails() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.withPassword("alice", "secret")) {
            Proxy proxy = socksProxy(socks.port(), "alice", "wrong");
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                String url = "http://127.0.0.1:" + http.getAddress().getPort() + "/ping";
                assertThrows(Exception.class, () -> client.execute(new HttpGet(url)));
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksCredentialsFromEnvMap() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.withPassword("alice", "secret")) {
            Proxy proxy = socksProxy(socks.port(), null, null);
            Map<String, String> env = new HashMap<>();
            env.put("MICROSOCKS_USER", "alice");
            env.put("MICROSOCKS_PASS", "secret");
            Proxy resolved = HttpClientFactory.withResolvedCredentials(proxy, env);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(resolved)) {
                String url = "http://127.0.0.1:" + http.getAddress().getPort() + "/ping";
                try (CloseableHttpResponse response = client.execute(new HttpGet(url))) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                }
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void socksGetViaHostnameUsesDomainAtyp() throws Exception {
        HttpServer http = Socks5TestProxy.startHttpEcho();
        try (Socks5TestProxy socks = Socks5TestProxy.noAuth()) {
            Proxy proxy = socksProxy(socks.port(), null, null);
            try (CloseableHttpClient client = HttpClientFactory.createHttpClient(proxy)) {
                String url = "http://localhost:" + http.getAddress().getPort() + "/ping";
                try (CloseableHttpResponse response = client.execute(new HttpGet(url))) {
                    assertEquals(200, response.getStatusLine().getStatusCode());
                    assertEquals("pong", EntityUtils.toString(response.getEntity(), StandardCharsets.US_ASCII));
                }
            }
        } finally {
            http.stop(0);
        }
    }

    @Test
    void resolveCredentialsPrefersConfigOverEnv() {
        Proxy proxy = new Proxy();
        proxy.setHost("proxy.example");
        proxy.setPort(7777);
        proxy.setUsername("from-config");
        proxy.setPassword("from-config-pass");
        Proxy resolved = HttpClientFactory.withResolvedCredentials(proxy);
        assertEquals("from-config", resolved.getUsername());
        assertEquals("from-config-pass", resolved.getPassword());
    }

    @Test
    void resolveCredentialsFromAllureNotificationsEnv() {
        Proxy proxy = new Proxy();
        proxy.setHost("proxy.example");
        proxy.setPort(7777);
        Map<String, String> env = new HashMap<>();
        env.put("ALLURE_NOTIFICATIONS_PROXY_USERNAME", "env-user");
        env.put("ALLURE_NOTIFICATIONS_PROXY_PASSWORD", "env-pass");
        Proxy resolved = HttpClientFactory.withResolvedCredentials(proxy, env);
        assertEquals("env-user", resolved.getUsername());
        assertEquals("env-pass", resolved.getPassword());
    }

    @Test
    void parseIpv4() {
        byte[] address = Socks5Tunnel.parseIpv4("127.0.0.1");
        assertNotNull(address);
        assertEquals(127, address[0] & 0xFF);
        assertEquals(1, address[3] & 0xFF);
        assertNull(Socks5Tunnel.parseIpv4("localhost"));
        assertNull(Socks5Tunnel.parseIpv4("127.0.0.256"));
        assertNull(Socks5Tunnel.parseIpv4("01.0.0.1"));
    }

    private static Proxy socksProxy(int port, String username, String password) {
        Proxy proxy = new Proxy();
        proxy.setType("socks5");
        proxy.setHost("127.0.0.1");
        proxy.setPort(port);
        proxy.setUsername(username);
        proxy.setPassword(password);
        return proxy;
    }
}
