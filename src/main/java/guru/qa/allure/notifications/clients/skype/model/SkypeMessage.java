package guru.qa.allure.notifications.clients.skype.model;

import java.util.List;

public class SkypeMessage {
    public String type;
    public From from;
    public String text;
    public List<Attachment> attachments;
}
