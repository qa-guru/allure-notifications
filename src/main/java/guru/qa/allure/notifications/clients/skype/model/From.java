package guru.qa.allure.notifications.clients.skype.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class From {
    private String id;
    private String name;
}
