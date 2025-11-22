package guru.qa.allure.notifications.clients.influxdb;

import guru.qa.allure.notifications.clients.ClientFactory;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.influxdb.Influxdb;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ClientFactoryInfluxdbTest {

    @Test
    void shouldCreateInfluxdbClientWhenEnabled() {
        Config config = new Config();
        Influxdb influxdb = buildInfluxConfig(true);
        config.setInfluxdb(influxdb);

        List<Notifier> notifiers = ClientFactory.from(config);

        assertEquals(1, notifiers.size(), "Only InfluxdbClient expected");
        assertInstanceOf(InfluxdbClient.class, notifiers.get(0));
    }

    @Test
    void shouldNotCreateInfluxdbClientWhenDisabled() {
        Config config = new Config();
        Influxdb influxdb = buildInfluxConfig(false);
        influxdb.setEnabled(false);
        config.setInfluxdb(influxdb);

        List<Notifier> notifiers = ClientFactory.from(config);

        assertTrue(notifiers.isEmpty(), "No clients expected when Influxdb disabled");
    }

    @Test
    void shouldNotCreateInfluxdbClientWhenConfigNull() {
        Config config = new Config();

        List<Notifier> notifiers = ClientFactory.from(config);

        assertTrue(notifiers.isEmpty(), "No clients expected when Influxdb config absent");
    }

    private Influxdb buildInfluxConfig(boolean enabled) {
        Map<String, String> tags = new HashMap<>();
        tags.put("env", "test");

        Influxdb influxdb = new Influxdb();
        influxdb.setEnabled(enabled);
        influxdb.setUrl("http://localhost:8086");
        influxdb.setToken("test-token");
        influxdb.setOrg("test-org");
        influxdb.setBucket("test-bucket");
        influxdb.setMeasurement("test-measurement");
        influxdb.setTags(tags);
        return influxdb;
    }
}

