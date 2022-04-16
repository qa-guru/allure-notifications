package guru.qa.allure.notifications.model.legend;

import com.google.gson.annotations.SerializedName;

/**
 * @author kadehar
 * @since 4.0
 * Model class, representing chart legend phrases.
 */
public class Legend {
    @SerializedName("passed")
    private String passed;
    @SerializedName("failed")
    private String failed;
    @SerializedName("broken")
    private String broken;
    @SerializedName("unknown")
    private String unknown;
    @SerializedName("skipped")
    private String skipped;

    public String passed() {
        return passed;
    }

    public void setPassed(String passed) {
        this.passed = passed;
    }

    public String failed() {
        return failed;
    }

    public void setFailed(String failed) {
        this.failed = failed;
    }

    public String broken() {
        return broken;
    }

    public void setBroken(String broken) {
        this.broken = broken;
    }

    public String unknown() {
        return unknown;
    }

    public void setUnknown(String unknown) {
        this.unknown = unknown;
    }

    public String skipped() {
        return skipped;
    }

    public void setSkipped(String skipped) {
        this.skipped = skipped;
    }
}
