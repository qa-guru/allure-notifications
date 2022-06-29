package guru.qa.allure.notifications.chart;

public enum Color {
    BLACK(new int[]{0, 0, 0}),
    GREEN(new int[]{148, 202, 102}),
    RED(new int[]{255, 87, 68}),
    YELLOW(new int[]{255, 206, 87}),
    GRAY(new int[]{170, 170, 170}),
    PURPLE(new int[]{216, 97,  190});
    public final int[] rgb;

    Color(int[] rgb) {
        this.rgb = rgb;
    }
}
