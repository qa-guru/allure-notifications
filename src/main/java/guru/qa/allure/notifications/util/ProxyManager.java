package guru.qa.allure.notifications.util;

import guru.qa.allure.notifications.config.proxy.Proxy;
import kong.unirest.Unirest;
import org.apache.commons.lang3.StringUtils;

public class ProxyManager {
    public static void manageProxy(Proxy proxy) {
        if (proxy != null) {
            if(StringUtils.isNotEmpty(proxy.getHost()) && proxy.getPort() != 0){
                if (StringUtils.isNotEmpty(proxy.getUsername()) && StringUtils.isNotEmpty(proxy.getPassword())) {
                    Unirest.config().proxy(proxy.getHost(), proxy.getPort(),
                            proxy.getUsername(), proxy.getPassword());
                }else{
                    Unirest.config().proxy(proxy.getHost(), proxy.getPort());
                }
            }
        }
    }
}
