package guru.qa.allure.notifications.clients.slack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextObject {
    public static final String TYPE = "mrkdwn";
    private final String type = TYPE;
    private String text;
}
