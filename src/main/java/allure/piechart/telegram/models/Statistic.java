package allure.piechart.telegram.models;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Statistic {

    @JsonProperty("failed")
    private Integer failed;
    @JsonProperty("broken")
    private Integer broken;
    @JsonProperty("skipped")
    private Integer skipped;
    @JsonProperty("passed")
    private Integer passed;
    @JsonProperty("unknown")
    private Integer unknown;
    @JsonProperty("total")
    private Integer total;

    @JsonProperty("failed")
    public Integer getFailed() {
        return failed;
    }

    @JsonProperty("broken")
    public Integer getBroken() {
        return broken;
    }

    @JsonProperty("skipped")
    public Integer getSkipped() {
        return skipped;
    }

    @JsonProperty("passed")
    public Integer getPassed() {
        return passed;
    }

    @JsonProperty("unknown")
    public Integer getUnknown() {
        return unknown;
    }

    @JsonProperty("total")
    public Integer getTotal() {
        return total;
    }

}
