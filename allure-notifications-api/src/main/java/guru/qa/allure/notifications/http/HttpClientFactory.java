package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.ssl.SSLContexts;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public class HttpClientFactory {
    static final String DEFAULT_MICROSOCKS_ENV_FILE = "/opt/qa-guru/etc/microsocks.env";

    private HttpClientFactory() {
    }

    public static CloseableHttpClient createHttpClient(Proxy proxy) {
        return createHttpClient(proxy, SSLContexts.createSystemDefault());
    }

    static CloseableHttpClient createHttpClient(Proxy proxy, SSLContext sslContext) {
        if (!isConfigured(proxy)) {
            return HttpClients.custom().build();
        }
        Proxy resolved = withResolvedCredentials(proxy, System.getenv());
        if (resolved.isSocks()) {
            return createSocksClient(resolved, sslContext);
        }
        return createHttpProxyClient(resolved);
    }

    static boolean isConfigured(Proxy proxy) {
        return proxy != null
                && StringUtils.isNotEmpty(proxy.getHost())
                && proxy.getPort() != null
                && proxy.getPort() > 0;
    }

    static Proxy withResolvedCredentials(Proxy proxy) {
        return withResolvedCredentials(proxy, System.getenv());
    }

    static Proxy withResolvedCredentials(Proxy proxy, Map<String, String> env) {
        Map<String, String> fileEnv = readEnvFile(firstNonBlank(
                mapGet(env, "MICROSOCKS_ENV_FILE"),
                DEFAULT_MICROSOCKS_ENV_FILE));
        Proxy copy = new Proxy();
        copy.setType(proxy.getType());
        copy.setHost(proxy.getHost());
        copy.setPort(proxy.getPort());
        copy.setUsername(firstNonBlank(
                proxy.getUsername(),
                mapGet(env, "MICROSOCKS_USER"),
                mapGet(env, "ALLURE_NOTIFICATIONS_PROXY_USERNAME"),
                mapGet(fileEnv, "MICROSOCKS_USER"),
                mapGet(fileEnv, "ALLURE_NOTIFICATIONS_PROXY_USERNAME")));
        copy.setPassword(firstNonBlank(
                proxy.getPassword(),
                mapGet(env, "MICROSOCKS_PASS"),
                mapGet(env, "ALLURE_NOTIFICATIONS_PROXY_PASSWORD"),
                mapGet(fileEnv, "MICROSOCKS_PASS"),
                mapGet(fileEnv, "ALLURE_NOTIFICATIONS_PROXY_PASSWORD")));
        return copy;
    }

    static Map<String, String> readEnvFile(String path) {
        if (StringUtils.isBlank(path)) {
            return Collections.emptyMap();
        }
        Path file = Paths.get(path);
        if (!Files.isRegularFile(file)) {
            return Collections.emptyMap();
        }
        try {
            Map<String, String> values = new LinkedHashMap<String, String>();
            for (String raw : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                parseEnvLine(raw, values);
            }
            return values;
        } catch (IOException expected) {
            return Collections.emptyMap();
        }
    }

    static void parseEnvLine(String raw, Map<String, String> values) {
        if (raw == null || values == null) {
            return;
        }
        String line = raw.trim();
        if (line.isEmpty() || line.charAt(0) == '#') {
            return;
        }
        if (line.startsWith("export ")) {
            line = line.substring("export ".length()).trim();
        }
        int separator = line.indexOf('=');
        if (separator <= 0) {
            return;
        }
        String key = line.substring(0, separator).trim();
        String value = line.substring(separator + 1).trim();
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                value = value.substring(1, value.length() - 1);
            }
        }
        values.put(key, value);
    }

    private static CloseableHttpClient createSocksClient(Proxy proxy, SSLContext sslContext) {
        Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("http", new SocksPlainConnectionSocketFactory(proxy))
                .register("https", new SocksSslConnectionSocketFactory(proxy, sslContext))
                .build();
        PoolingHttpClientConnectionManager manager = new PoolingHttpClientConnectionManager(registry);
        return HttpClients.custom()
                .setConnectionManager(manager)
                .build();
    }

    private static CloseableHttpClient createHttpProxyClient(Proxy proxy) {
        HttpClientBuilder builder = HttpClients.custom();
        HttpHost proxyHost = new HttpHost(proxy.getHost(), proxy.getPort(), "http");
        builder.setProxy(proxyHost);
        if (StringUtils.isNotEmpty(proxy.getUsername()) && StringUtils.isNotEmpty(proxy.getPassword())) {
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                    new AuthScope(proxyHost),
                    new UsernamePasswordCredentials(proxy.getUsername(), proxy.getPassword())
            );
            builder.setDefaultCredentialsProvider(credentialsProvider);
        }
        return builder.build();
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private static String mapGet(Map<String, String> env, String name) {
        if (env == null) {
            return null;
        }
        return env.get(name);
    }
}
