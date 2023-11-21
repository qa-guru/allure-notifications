package guru.qa.allure.notifications.clients.skype.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SkypeMessage {

    private String type;
    private From from;
    private String text;
    private List<Attachment> attachments;
}
