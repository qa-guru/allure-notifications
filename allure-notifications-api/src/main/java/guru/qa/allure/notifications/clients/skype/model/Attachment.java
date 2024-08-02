package guru.qa.allure.notifications.clients.skype.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Attachment {
    private String contentType;
    private String contentUrl;
    private String name;
}
