package guru.qa.allure.notifications.clients.influxdb;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import com.influxdb.client.WriteApiBlocking;
import com.influxdb.client.domain.WritePrecision;
import com.influxdb.client.write.Point;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.influxdb.Influxdb;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.model.summary.Time;
import guru.qa.allure.notifications.template.data.MessageData;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;

@Slf4j
public class InfluxdbClient implements Notifier {
    private final Influxdb influxdb;

    public InfluxdbClient(Influxdb influxdb) {
        this.influxdb = influxdb;
    }

    @Override
    public void sendText(MessageData messageData) throws MessagingException {
        send(messageData);
    }

    @Override
    public void sendPhoto(MessageData messageData, byte[] chartImage) throws MessagingException {
        send(messageData);
    }

    @SneakyThrows
    private void send(MessageData messageData) {
        try (InfluxDBClient influxDBClient = InfluxDBClientFactory.create(influxdb.getUrl(), influxdb.getToken().toCharArray(), influxdb.getOrg(), influxdb.getBucket());){
            WriteApiBlocking writeApi = influxDBClient.getWriteApiBlocking();
            Point point = buildPoint(messageData);
            log.info("Sending data to InfluxDB {}", influxdb.getUrl());
            writeApi.writePoint(point);
        } catch (Exception e) {
            log.error("error", e);
        }
    }

    private Point buildPoint(MessageData messageData) {
        Point point = Point.measurement(influxdb.getMeasurement());
        influxdb.getTags().forEach(point::addTag);
        Statistic stat = (Statistic) messageData.getValues().get("statistic");
        Time time = (Time) messageData.getValues().get("timeData");

        Arrays.stream(stat.getClass().getDeclaredFields()).forEach(field -> {
            field.setAccessible(true);
            try {
                point.addField(field.getName(), (Integer) field.get(stat));
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        });

        point.addField("duration", time.getDuration());

        if (time.getStop() != null) point.time(time.getStop(), WritePrecision.MS);

        return point;
    }

}
