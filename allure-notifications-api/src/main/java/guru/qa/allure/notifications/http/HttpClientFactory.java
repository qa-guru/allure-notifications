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
import java.util.Map;

public class HttpClientFactory {
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
        Proxy copy = new Proxy();
        copy.setType(proxy.getType());
        copy.setHost(proxy.getHost());
        copy.setPort(proxy.getPort());
        copy.setUsername(firstNonBlank(
                proxy.getUsername(),
                mapGet(env, "MICROSOCKS_USER"),
                mapGet(env, "ALLURE_NOTIFICATIONS_PROXY_USERNAME")));
        copy.setPassword(firstNonBlank(
                proxy.getPassword(),
                mapGet(env, "MICROSOCKS_PASS"),
                mapGet(env, "ALLURE_NOTIFICATIONS_PROXY_PASSWORD")));
        return copy;
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
