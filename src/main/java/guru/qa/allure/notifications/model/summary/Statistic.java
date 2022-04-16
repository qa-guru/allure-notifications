package guru.qa.allure.notifications.model.summary;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 1.0
 * Model class, representing test statistic from Allure Report.
 */
public class Statistic {
    @SerializedName("passed")
    private Integer passed;
    @SerializedName("failed")
    private Integer failed;
    @SerializedName("broken")
    private Integer broken;
    @SerializedName("skipped")
    private Integer skipped;
    @SerializedName("unknown")
    private Integer unknown;
    @SerializedName("total")
    private Integer total;

    public Integer passed() {
        return passed;
    }

    public void setPassed(Integer passed) {
        this.passed = passed;
    }

    public Integer failed() {
        return failed;
    }

    public void setFailed(Integer failed) {
        this.failed = failed;
    }

    public Integer broken() {
        return broken;
    }

    public void setBroken(Integer broken) {
        this.broken = broken;
    }

    public Integer skipped() {
        return skipped;
    }

    public void setSkipped(Integer skipped) {
        this.skipped = skipped;
    }

    public Integer unknown() {
        return unknown;
    }

    public void setUnknown(Integer unknown) {
        this.unknown = unknown;
    }

    public Integer total() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }
}
