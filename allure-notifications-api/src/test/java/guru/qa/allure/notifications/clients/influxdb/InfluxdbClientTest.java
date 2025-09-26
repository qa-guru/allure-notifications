package guru.qa.allure.notifications.clients.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.write.Point;
import guru.qa.allure.notifications.config.influxdb.Influxdb;
import guru.qa.allure.notifications.template.data.MessageData;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Time;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InfluxdbClientTest {

    @Mock private InfluxDBClient influxDBClient;
    @Mock private WriteApiBlocking writeApi;
    @Mock private MessageData messageData;

    @Test
    void sendText_shouldWritePoint() throws Exception {
        Influxdb cfg = buildInfluxConfig();
        Map<String, Object> values = prepareMessageValues(true); // with stop
        when(messageData.getValues()).thenReturn(values);
        when(influxDBClient.getWriteApiBlocking()).thenReturn(writeApi);

        try (MockedStatic<InfluxDBClientFactory> factoryMock = mockStatic(InfluxDBClientFactory.class)) {
            factoryMock.when(() -> InfluxDBClientFactory.create(cfg.getUrl(), cfg.getToken().toCharArray(), cfg.getOrg(), cfg.getBucket()))
                    .thenReturn(influxDBClient);

            InfluxdbClient client = new InfluxdbClient(cfg);
            assertDoesNotThrow(() -> client.sendText(messageData));

            verify(influxDBClient).getWriteApiBlocking();
            ArgumentCaptor<Point> pointCaptor = ArgumentCaptor.forClass(Point.class);
            verify(writeApi).writePoint(pointCaptor.capture());
            verify(influxDBClient).close();

            Point p = pointCaptor.getValue();
            String lp = p.toLineProtocol();
            assertTrue(lp.startsWith(cfg.getMeasurement()+","));
            assertTrue(lp.contains("env=test"));
            assertTrue(lp.contains("passed=10i"));
            assertTrue(lp.contains("failed=2i"));
            assertTrue(lp.contains("broken=1i"));
            assertTrue(lp.contains("skipped=3i"));
            assertTrue(lp.contains("unknown=0i"));
            assertTrue(lp.contains("total=16i"));
            assertTrue(lp.contains("duration=5000i"));
            // timestamp (stop) should be present after a space
            assertTrue(lp.matches(".* \\d+"), "Expected timestamp at end when stop present");
        }
    }

    @Test
    void sendPhoto_shouldWritePoint() throws Exception {
        Influxdb cfg = buildInfluxConfig();
        Map<String, Object> values = prepareMessageValues(false); // stop null
        when(messageData.getValues()).thenReturn(values);
        when(influxDBClient.getWriteApiBlocking()).thenReturn(writeApi);

        try (MockedStatic<InfluxDBClientFactory> factoryMock = mockStatic(InfluxDBClientFactory.class)) {
            factoryMock.when(() -> InfluxDBClientFactory.create(cfg.getUrl(), cfg.getToken().toCharArray(), cfg.getOrg(), cfg.getBucket()))
                    .thenReturn(influxDBClient);

            InfluxdbClient client = new InfluxdbClient(cfg);
            assertDoesNotThrow(() -> client.sendPhoto(messageData, new byte[]{}));

            ArgumentCaptor<Point> pointCaptor = ArgumentCaptor.forClass(Point.class);
            verify(writeApi).writePoint(pointCaptor.capture());
            Point p = pointCaptor.getValue();
            String lp = p.toLineProtocol();
            assertFalse(lp.matches(".* \\d+"), "Expected no timestamp when stop is null");
        }
    }

    @Test
    void sendText_shouldSwallowExceptions() throws Exception {
        Influxdb cfg = buildInfluxConfig();

        RuntimeException failure = new RuntimeException("boom");

        try (MockedStatic<InfluxDBClientFactory> factoryMock = mockStatic(InfluxDBClientFactory.class)) {
            when(influxDBClient.getWriteApiBlocking()).thenThrow(failure);
            factoryMock.when(() -> InfluxDBClientFactory.create(cfg.getUrl(), cfg.getToken().toCharArray(), cfg.getOrg(), cfg.getBucket()))
                    .thenReturn(influxDBClient);
            InfluxdbClient client = new InfluxdbClient(cfg);
            assertDoesNotThrow(() -> client.sendText(messageData));
        }
    }

    private Map<String, Object> prepareMessageValues(boolean withStop) throws Exception {
        Statistic stat = new Statistic();
        setField(stat, "passed", 10);
        setField(stat, "failed", 2);
        setField(stat, "broken", 1);
        setField(stat, "skipped", 3);
        setField(stat, "unknown", 0);
        setField(stat, "total", 16);

        Time time = new Time();
        setField(time, "duration", 5000L);
        if (withStop) setField(time, "stop", 1700000000000L);

        Map<String, Object> map = new HashMap<>();
        map.put("statistic", stat);
        map.put("timeData", time);
        return map;
    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(name);
        f.setAccessible(true);
        f.set(target, value);
    }

    private Influxdb buildInfluxConfig() {
        Map<String, String> tags = new HashMap<>();
        tags.put("env", "test");

        Influxdb influxdb = new Influxdb();
        influxdb.setEnabled(true);
        influxdb.setUrl("http://localhost:8086");
        influxdb.setToken("token");
        influxdb.setOrg("org");
        influxdb.setBucket("bucket");
        influxdb.setMeasurement("allure_stats");
        influxdb.setTags(tags);
        return influxdb;
    }
}
