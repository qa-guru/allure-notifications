package guru.qa.allure.notifications.config.proxy;

import lombok.Data;
import org.apache.commons.lang3.StringUtils;

/**
 * @author kadehar
 * @since 4.0
 * Model class representing proxy settings.
 */
@Data
public class Proxy {
    /**
     * {@code http} (default) or {@code socks5}.
     */
    private String type;
    private String host;
    private Integer port;
    private String username;
    private String password;

    public String getEffectiveType() {
        return StringUtils.isBlank(type) ? "http" : type.trim().toLowerCase();
    }

    public boolean isSocks() {
        String effectiveType = getEffectiveType();
        return "socks5".equals(effectiveType) || "socks".equals(effectiveType);
    }
}
