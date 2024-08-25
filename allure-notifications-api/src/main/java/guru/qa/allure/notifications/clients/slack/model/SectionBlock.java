package guru.qa.allure.notifications.clients.slack.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionBlock implements LayoutBlock {
    public static final String TYPE = "section";
    private final String type = TYPE;
    private TextObject text;
    private List<TextObject> fields;
}
