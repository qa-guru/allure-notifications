package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.proxy.Proxy;
import kong.unirest.Unirest;

public class ProxyManager {
    public static void manageProxy(Proxy proxy) {
        if (proxy != null) {
            if (!proxy.host().equals("") && proxy.port() != 0
                    && !proxy.username().equals("") && !proxy.password().equals("")) {
                Unirest.config().proxy(proxy.host(), proxy.port(),
                        proxy.username(), proxy.password());
            } else if (!proxy.host().equals("") && proxy.port() != 0) {
                Unirest.config().proxy(proxy.host(), proxy.port());
            }
        }
    }
}
