package guru.qa.allure.notifications.clients.gitlab;

import guru.qa.allure.notifications.config.gitlab.Gitlab;
import guru.qa.allure.notifications.model.phrases.Phrases;
import guru.qa.allure.notifications.model.phrases.Scenario;
import guru.qa.allure.notifications.model.summary.Statistic;
import guru.qa.allure.notifications.template.data.MessageData;
import kong.unirest.*;
import kong.unirest.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GitlabClientTest {
    private GitlabClient gitlabClient;
    private Gitlab gitlab;

    @Mock private MessageData messageData;
    @Mock private HttpRequestWithBody sendRequest;
    @Mock private RequestBodyEntity requestBodyEntity;
    @Mock private HttpResponse<String> httpResponseString;
    @Mock private HttpRequestWithBody uploadRequest;
    @Mock private HttpResponse<JsonNode> uploadResponseJson;
    @Mock private MultipartBody multipartBody;
    @Mock private JsonNode uploadJsonNode;

    @BeforeEach
    void setUp() throws Exception {
        gitlab = buildGitlabConfig();
        gitlabClient = new GitlabClient(gitlab);
        doReturn(prepareMessageValues()).when(messageData).getValues();

        when(sendRequest.routeParam(anyString(), anyString())).thenReturn(sendRequest);
        when(sendRequest.header(anyString(), anyString())).thenReturn(sendRequest);
        when(sendRequest.body(any(Map.class))).thenReturn(requestBodyEntity);
        when(requestBodyEntity.asString()).thenReturn(httpResponseString);
        when(httpResponseString.getBody()).thenReturn("ok");
    }

    @Test
    void sendText_shouldNotThrow() {
        try (MockedStatic<Unirest> unirest = Mockito.mockStatic(Unirest.class)) {
            unirest.when(() -> Unirest.post(contains("/notes"))).thenReturn(sendRequest);
            assertDoesNotThrow(() -> gitlabClient.sendText(messageData));
        }
    }

    @Test
    void sendPhoto_shouldNotThrow() {
        try (MockedStatic<Unirest> unirest = Mockito.mockStatic(Unirest.class)) {
            unirest.when(() -> Unirest.post(contains("/notes"))).thenReturn(sendRequest);
            unirest.when(() -> Unirest.post(contains("/uploads"))).thenReturn(uploadRequest);
            when(uploadRequest.routeParam(anyString(), anyString())).thenReturn(uploadRequest);
            when(uploadRequest.header(anyString(), anyString())).thenReturn(uploadRequest);
            when(uploadRequest.field(anyString(), any(), any(), anyString())).thenReturn(multipartBody);
            when(multipartBody.asJson()).thenReturn(uploadResponseJson);
            when(uploadResponseJson.getBody()).thenReturn(uploadJsonNode);
            when(uploadJsonNode.getObject()).thenReturn(new JSONObject());
            assertDoesNotThrow(() -> gitlabClient.sendPhoto(messageData, new byte[]{1, 2, 3}));
        }
    }


    private Map<String, Object> prepareMessageValues() throws Exception {
        Statistic stat = new Statistic();
        setField(stat, "passed", 10);
        setField(stat, "failed", 2);
        setField(stat, "broken", 1);
        setField(stat, "skipped", 3);
        setField(stat, "unknown", 0);
        setField(stat, "total", 16);

        Scenario scenario = new Scenario();
        setField(scenario, "duration", "duration");
        setField(scenario, "totalScenarios", "totalScenarios");
        setField(scenario, "totalPassed", "totalPassed");
        setField(scenario, "totalFailed", "totalFailed");
        setField(scenario, "totalBroken", "totalBroken");
        setField(scenario, "totalUnknown", "totalUnknown");
        setField(scenario, "totalSkipped", "totalSkipped");

        Phrases phrases = new Phrases();
        setField(phrases, "results", "results");
        setField(phrases, "environment", "environment");
        setField(phrases, "comment", "comment");
        setField(phrases, "reportAvailableAtLink", "reportAvailableAtLink");
        setField(phrases, "scenario", scenario);
        setField(phrases, "numberOfSuites", "numberOfSuites");
        setField(phrases, "suiteName", "suiteName");

        Map<String, Object> map = new HashMap<>();
        map.put("environment", "environment");
        map.put("comment", "comment");
        map.put("reportLink", "reportLink");
        map.put("customData", null);
        map.put("time", "time");
        map.put("statistic", stat);
        map.put("suitesSummaryJson", null);
        map.put("phrases", phrases);
        return map;

    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field f = target.getClass().getDeclaredField(name);
        f.setAccessible(true);
        f.set(target, value);
    }

    private Gitlab buildGitlabConfig() {
        Gitlab gitlab = new Gitlab();
        gitlab.setUrl("https://gitlab.example.com");
        gitlab.setApiKey("apiKey");
        gitlab.setApiToken("apiToken");
        gitlab.setProjectId("123");
        gitlab.setMergeRequestIid("1");
        return gitlab;
    }

}
