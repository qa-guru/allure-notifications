package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Testing pyramid layer colors — accessible palette.
 *
 * <p>
 * Layers use an accessible palette with distinct light/dark variants, except
 * {@code unit}, which deliberately reuses the Allure 3 passed color from
 * {@link ChartTheme#STATUS_PASSED}. This keeps the pyramid base visually tied to
 * the success segment in the pie and prevents duplicated color constants from
 * drifting again; component/manual remain brand orange/blue.
 *
 * <p>
 * SSOT (monorepo): {@code stacks/java-spring/tests/allure/pyramid-layers.json}.
 * Consumers verified by {@code scripts/pyramid_palette_sync.py --check}. Mirrored in
 * {@code tokens.css} {@code --layer-*} and {@code pyramid-layer-colors.mjs}.
 * Layer keys: {@code docs/rag/testing/test-layers.md}.
 */
public final class PyramidLayerColors {

    /** Label for non-SSOT layer values aggregated into a gray top band. */
    public static final String OTHER_LAYER = "other";

    /** Bottom → top band order in the testing pyramid chart. */
    public static final List<String> ORDER_BOTTOM_TO_TOP = Collections.unmodifiableList(Arrays.asList(
            "unit",
            "component",
            "integration",
            "api",
            "e2e",
            "manual"
    ));

    private static final Color OTHER_LIGHT = Color.decode("#64748b");
    private static final Color OTHER_DARK = Color.decode("#5d6876");

    private static final Map<String, Color> LIGHT = layerMap(
            ChartTheme.STATUS_PASSED, // unit = Allure 3 passed / pie success
            "#ff8200", // component — brand orange
            "#7e22ce", // integration
            "#e8bd00", // api
            "#dc2626", // e2e
            "#459bde"  // manual — brand blue
    );

    private static final Map<String, Color> DARK = layerMap(
            ChartTheme.STATUS_PASSED, // unit = Allure 3 passed / pie success
            "#ffa833", // component — brand orange
            "#a65ac4", // integration
            "#ffd833", // api
            "#ff574f", // e2e
            "#61b6fb"  // manual — brand blue
    );

    private PyramidLayerColors() {
    }

    public static List<String> orderedLayers() {
        return ORDER_BOTTOM_TO_TOP;
    }

    public static Color colorFor(String layer, boolean darkMode) {
        if (layer == null) {
            return null;
        }
        String key = layer.trim().toLowerCase(Locale.ROOT);
        Map<String, Color> palette = darkMode ? DARK : LIGHT;
        return palette.get(key);
    }

    public static boolean isKnownLayer(String layer) {
        return layer != null && LIGHT.containsKey(layer.trim().toLowerCase(Locale.ROOT));
    }

    public static Color colorForOther(boolean darkMode) {
        return darkMode ? OTHER_DARK : OTHER_LIGHT;
    }

    private static Map<String, Color> layerMap(Color unit,
                                               String component,
                                               String integration,
                                               String api,
                                               String e2e,
                                               String manual) {
        Map<String, Color> map = new LinkedHashMap<String, Color>();
        map.put("unit", unit);
        map.put("component", Color.decode(component));
        map.put("integration", Color.decode(integration));
        map.put("api", Color.decode(api));
        map.put("e2e", Color.decode(e2e));
        map.put("manual", Color.decode(manual));
        return Collections.unmodifiableMap(map);
    }
}
