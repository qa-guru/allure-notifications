package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.helpers.Proxy;
import kong.unirest.Unirest;

public class ProxyManager {
    public static void manageProxy() {
        if (!Proxy.host().equals("") && Proxy.port() != 0
                && !Proxy.username().equals("") && !Proxy.password().equals("")) {
            Unirest.config().proxy(Proxy.host(), Proxy.port(),
                    Proxy.username(), Proxy.password());
        } else if (!Proxy.host().equals("") && Proxy.port() != 0) {
            Unirest.config().proxy(Proxy.host(), Proxy.port());
        }
    }
}
