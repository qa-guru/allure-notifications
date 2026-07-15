package guru.qa.allure.notifications.clients;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import guru.qa.allure.notifications.report.AllureReportVersion;
import guru.qa.allure.notifications.report.LocatedReport;
import guru.qa.allure.notifications.report.ReportLocator;
import guru.qa.allure.notifications.report.SummaryReader;
import guru.qa.allure.notifications.template.data.MessageData;

@ExtendWith(MockitoExtension.class)
class NotificationTests {
    private static final String PHRASES_PATH = "/phrases/en.json";
    private static final String LEGEND_PATH = "/legend/en.json";
    private static final String ALLURE_PATH = "/allure";

    private static final Summary SUMMARY = new Summary();

    @Mock
    private Notifier notifier;

    static Stream<Arguments> inputData() {
        return Stream.of(
                Arguments.of(false, null, 0, 1),
                Arguments.of(true, new Legend(), 1, 0)
        );
    }

    @ParameterizedTest
    @MethodSource("inputData")
    void shouldSendNotification(boolean chartEnabled, Legend legend, int chartActionsCount, int textActionsCount)
            throws MessagingException, IOException {
        Config config = getConfig(chartEnabled, true);
        Base base = config.getBase();
        byte[] chartImg = new byte[]{};
        Path reportRoot = Paths.get(ALLURE_PATH);
        Path summaryPath = reportRoot.resolve("widgets/summary.json");
        Path suitesPath = reportRoot.resolve("widgets/suites.json");
        LocatedReport located = new LocatedReport(
                reportRoot, summaryPath, AllureReportVersion.ALLURE_2, suitesPath, null);

        try (MockedConstruction<JSON> jsonUtilsMock = mockConstruction(JSON.class,
                (mock, context) -> {
                    when(mock.parseResource(PHRASES_PATH, Phrases.class)).thenCallRealMethod();
                    when(mock.parseResource(LEGEND_PATH, Legend.class)).thenReturn(legend);
                });
             MockedStatic<ClientFactory> clientFactoryMock = mockStatic(ClientFactory.class);
             MockedStatic<ReportLocator> reportLocatorMock = mockStatic(ReportLocator.class);
             MockedStatic<SummaryReader> summaryReaderMock = mockStatic(SummaryReader.class);
             MockedStatic<Files> filesMock = mockStatic(Files.class);
             MockedStatic<Chart> chartMock = mockStatic(Chart.class)) {

            clientFactoryMock.when(() -> ClientFactory.from(config)).thenReturn(Collections.singletonList(notifier));
            reportLocatorMock.when(() -> ReportLocator.locate(any(Path.class))).thenReturn(located);
            summaryReaderMock.when(() -> SummaryReader.read(any(JSON.class), eq(located))).thenReturn(SUMMARY);
            filesMock.when(() -> Files.readAllBytes(suitesPath)).thenReturn(new byte[]{});
            chartMock.when(() -> Chart.createChart(base, SUMMARY, legend)).thenReturn(chartImg);

            Notification.send(config);

            clientFactoryMock.verify(() -> ClientFactory.from(config));
            JSON json = jsonUtilsMock.constructed().get(0);
            verify(json).parseResource(PHRASES_PATH, Phrases.class);
            verify(json, times(chartActionsCount)).parseResource(LEGEND_PATH, Legend.class);
            chartMock.verify(() -> Chart.createChart(base, SUMMARY, legend), times(chartActionsCount));
            filesMock.verify(() -> Files.readAllBytes(suitesPath));
            verify(notifier, times(chartActionsCount)).sendPhoto(any(MessageData.class), eq(chartImg));
            verify(notifier, times(textActionsCount)).sendText(any(MessageData.class));
        }
    }

    @ParameterizedTest
    @CsvSource({
        "true, 1",
        "false, 0"
    })
    void shouldSendNotificationWithSuitesData(boolean enableSuitesPublishing, int suitesActionsCount)
            throws MessagingException, IOException {
        Config config = getConfig(false, enableSuitesPublishing);
        Path reportRoot = Paths.get(ALLURE_PATH);
        Path summaryPath = reportRoot.resolve("widgets/summary.json");
        Path suitesPath = reportRoot.resolve("widgets/suites.json");
        LocatedReport located = new LocatedReport(
                reportRoot,
                summaryPath,
                AllureReportVersion.ALLURE_2,
                enableSuitesPublishing ? suitesPath : null,
                null);

        try (MockedConstruction<JSON> ignored = mockConstruction(JSON.class,
                (mock, context) -> when(mock.parseResource(PHRASES_PATH, Phrases.class)).thenCallRealMethod());
             MockedStatic<ClientFactory> clientFactoryMock = mockStatic(ClientFactory.class);
             MockedStatic<ReportLocator> reportLocatorMock = mockStatic(ReportLocator.class);
             MockedStatic<SummaryReader> summaryReaderMock = mockStatic(SummaryReader.class);
             MockedStatic<Files> filesMock = mockStatic(Files.class)) {

            clientFactoryMock.when(() -> ClientFactory.from(config)).thenReturn(Collections.singletonList(notifier));
            reportLocatorMock.when(() -> ReportLocator.locate(any(Path.class))).thenReturn(located);
            summaryReaderMock.when(() -> SummaryReader.read(any(JSON.class), eq(located))).thenReturn(SUMMARY);
            filesMock.when(() -> Files.readAllBytes(suitesPath)).thenReturn(new byte[]{});

            Notification.send(config);

            filesMock.verify(() -> Files.readAllBytes(suitesPath), times(suitesActionsCount));
            if (suitesActionsCount == 0) {
                filesMock.verify(() -> Files.readAllBytes(any(Path.class)), never());
            }
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
