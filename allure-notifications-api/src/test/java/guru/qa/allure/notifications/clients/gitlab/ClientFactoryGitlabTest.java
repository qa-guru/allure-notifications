package guru.qa.allure.notifications.clients.gitlab;

import guru.qa.allure.notifications.clients.ClientFactory;
import guru.qa.allure.notifications.clients.Notifier;
import guru.qa.allure.notifications.config.Config;
import guru.qa.allure.notifications.config.gitlab.Gitlab;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;




class ClientFactoryGitlabTest {

    @Test
    void shouldCreateGitlabClientIfEnabled() {
        Config config = new Config();
        Gitlab gitlabConfig = buildGitlabConfig(true);
        config.setGitlab(gitlabConfig);

        List<Notifier> notifiers = ClientFactory.from(config);

        assertEquals(1, notifiers.size(), "Only GitlabClient expected");
        assertInstanceOf(GitlabClient.class, notifiers.get(0));
    }


    @Test
    void shouldNotCreateGitlabClientWhenConfigIsDisabled() {
        Config config = new Config();
        Gitlab gitlabConfig = buildGitlabConfig(false);
        config.setGitlab(gitlabConfig);
        List<Notifier> notifiers = ClientFactory.from(config);

        assertTrue(notifiers.isEmpty(), "No clients expected when Gitlab config is disabled");
    }

    @Test
    void shouldNotCreateGitlabClientWhenConfigNull() {
        Config config = new Config();

        List<Notifier> notifiers = ClientFactory.from(config);

        assertTrue(notifiers.isEmpty(), "No clients expected when Gitlab config is absent");
    }


    private Gitlab buildGitlabConfig(Boolean enabled) {
        Gitlab gitlab = new Gitlab();
        gitlab.setEnabled(enabled);
        gitlab.setUrl("https://gitlab.example.com");
        gitlab.setApiKey("apiKey");
        gitlab.setApiToken("apiToken");
        gitlab.setProjectId("123");
        gitlab.setMergeRequestIid("1");
        return gitlab;
    }


}