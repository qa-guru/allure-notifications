package allure.piechart.telegram.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Time {

    @JsonProperty("duration")
    private Long duration;

    @JsonProperty("duration")
    public Long getDuration() {
        return duration;
    }



}
