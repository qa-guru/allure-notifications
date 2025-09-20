package guru.qa.allure.notifications.config.influxdb;

import lombok.Data;

import java.util.Map;

@Data
public class Influxdb {
    private Boolean enabled = true;
    private String url;
    private String token;
    private String org;
    private String bucket;
    private String measurement;
    private Map<String, String> tags;
}
