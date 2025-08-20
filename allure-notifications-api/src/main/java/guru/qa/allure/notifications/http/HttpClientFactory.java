package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;

public class HttpClientFactory {

    public static CloseableHttpClient createHttpClient(Proxy proxy) {
        HttpClientBuilder builder = HttpClients.custom();

        if (proxy != null && StringUtils.isNotEmpty(proxy.getHost()) && proxy.getPort() != 0) {
            HttpHost proxyHost = new HttpHost(proxy.getHost(), proxy.getPort());
            builder.setProxy(proxyHost);

            if (StringUtils.isNotEmpty(proxy.getUsername()) && StringUtils.isNotEmpty(proxy.getPassword())) {
                CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
                credentialsProvider.setCredentials(
                    new AuthScope(proxyHost),
                    new UsernamePasswordCredentials(proxy.getUsername(), proxy.getPassword())
                );
                builder.setDefaultCredentialsProvider(credentialsProvider);
            }
        }

        return builder.build();
    }
}
