package guru.qa.allure.notifications.clients.slack.model;

import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageBlock implements LayoutBlock {
    public static final String TYPE = "image";
    private final String type = TYPE;
    private String fallback;

    @SerializedName("image_url")
    private String imageUrl;

    @SerializedName("alt_text")
    private String altText;
    private String title;
    private String blockId;
}

