package guru.qa.allure.notifications.clients;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.stream.Stream;

import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import guru.qa.allure.notifications.chart.Chart;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.base.Base;
import guru.qa.allure.notifications.config.enums.Language;
import guru.qa.allure.notifications.exceptions.MessagingException;
import guru.qa.allure.notifications.json.JSON;
import guru.qa.allure.notifications.model.legend.Legend;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.summary.Summary;
import guru.qa.allure.notifications.template.data.MessageData;

@ExtendWith(MockitoExtension.class)
class NotificationTests {
    private static final String SUITES_PATH = "widgets/suites.json";
    private static final String PHRASES_PATH = "/phrases/en.json";
    private static final String LEGEND_PATH = "/legend/en.json";
    private static final String ALLURE_PATH = "/allure";

    private static final Summary SUMMARY = new Summary();
    private static final Phrases PHRASES = new Phrases();

    @Mock private Notifier notifier;
    @Mock private Path path;

    static Stream<Arguments> inputData() {
        return Stream.of(
            Arguments.of(false, null,         0, 1),
            Arguments.of(true,  new Legend(), 1, 0)
        );
    }

    @ParameterizedTest
    @MethodSource("inputData")
    void shouldSendNotification(boolean chartEnabled, Legend legend, int chartActionsCount, int textActionsCount)
            throws MessagingException, IOException {
        Config config = getConfig(chartEnabled, true);
        Base base = config.getBase();
        byte[] chartImg = new byte[]{};

        try (MockedConstruction<JSON> jsonUtilsMock = mockConstruction(JSON.class,
                (mock, context) -> {
                    when(mock.parseFile(any(File.class), eq(Summary.class))).thenReturn(SUMMARY);
                    when(mock.parseResource(PHRASES_PATH, Phrases.class)).thenReturn(PHRASES);
                    when(mock.parseResource(LEGEND_PATH, Legend.class)).thenReturn(legend);
                });
             MockedStatic<ClientFactory> clientFactoryMock = mockStatic(ClientFactory.class);
             MockedStatic<Paths> pathsMock = mockStatic(Paths.class);
             MockedStatic<Files> filesMock = mockStatic(Files.class);
             MockedStatic<Chart> chartMock = mockStatic(Chart.class)) {

            clientFactoryMock.when(() -> ClientFactory.from(config)).thenReturn(Collections.singletonList(notifier));
            pathsMock.when(() -> Paths.get(ALLURE_PATH, SUITES_PATH)).thenReturn(path);
            chartMock.when(() -> Chart.createChart(base, SUMMARY, legend)).thenReturn(chartImg);

            Notification.send(config);

            clientFactoryMock.verify(() -> ClientFactory.from(config));
            JSON json = jsonUtilsMock.constructed().get(0);
            verify(json).parseResource(PHRASES_PATH, Phrases.class);
            verify(json, times(chartActionsCount)).parseResource(LEGEND_PATH, Legend.class);
            chartMock.verify(() -> Chart.createChart(base, SUMMARY, legend), times(chartActionsCount));
            filesMock.verify(() -> Files.exists(path));
            filesMock.verify(() -> Files.readAllBytes(path), never());
            verify(notifier, times(chartActionsCount)).sendPhoto(any(MessageData.class), eq(chartImg));
            verify(notifier, times(textActionsCount)).sendText(any(MessageData.class));
        }
    }

    @ParameterizedTest
    @CsvSource({
        "true,  1",
        "false, 0"
    })
    void shouldSendNotificationWithSuitesData(boolean enableSuitesPublishing, int suitesActionsCount)
            throws MessagingException, IOException {
        Config config = getConfig(false, enableSuitesPublishing);

        try (MockedConstruction<JSON> jsonUtilsMock = mockConstruction(JSON.class);
             MockedStatic<ClientFactory> clientFactoryMock = mockStatic(ClientFactory.class);
             MockedStatic<Paths> pathsMock = mockStatic(Paths.class);
             MockedStatic<Files> filesMock = mockStatic(Files.class)) {
            clientFactoryMock.when(() -> ClientFactory.from(config)).thenReturn(Collections.singletonList(notifier));
            pathsMock.when(() -> Paths.get(ALLURE_PATH, SUITES_PATH)).thenReturn(path);
            filesMock.when(() -> Files.exists(path)).thenReturn(true);
            filesMock.when(() -> Files.readAllBytes(path)).thenReturn(new byte[]{});

            Notification.send(config);

            filesMock.verify(() -> Files.exists(path), times(suitesActionsCount));
            filesMock.verify(() -> Files.readAllBytes(path), times(suitesActionsCount));
        }
    }

    private Config getConfig(boolean enableChart, boolean enableSuitesPublishing) {
        Config config = new Config();
        Base base = new Base();
        base.setAllureFolder(ALLURE_PATH);
        base.setLanguage(Language.en);
        base.setEnableChart(enableChart);
        base.setEnableSuitesPublishing(enableSuitesPublishing);
        config.setBase(base);
        return config;
    }
}
