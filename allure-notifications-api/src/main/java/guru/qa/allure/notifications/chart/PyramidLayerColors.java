package guru.qa.allure.notifications.chart;

import java.awt.Color;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Testing pyramid layer colors — Palette A (cool → warm).
 *
 * <p>
 * SSOT in monorepo: {@code stacks/java-spring/.../tokens.css} {@code --layer-*},
 * {@code generators/ethalon/tests-java/.github/assets/dashboard-overrides.css}.
 * Layers: {@code docs/rag/testing/test-layers.md} · {@code PYRAMID_LAYERS} in {@code allure/constants.mjs}.
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
    private static final Color OTHER_DARK = Color.decode("#94a3b8");

    private static final Map<String, Color> LIGHT = layerMap(
            "#94a3b8",
            "#2563eb",
            "#0891b2",
            "#7c3aed",
            "#d97706",
            "#ea580c"
    );

    private static final Map<String, Color> DARK = layerMap(
            "#64748b",
            "#3b82f6",
            "#06b6d4",
            "#8b5cf6",
            "#f59e0b",
            "#f97316"
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

    private static Map<String, Color> layerMap(String unit,
                                               String component,
                                               String integration,
                                               String api,
                                               String e2e,
                                               String manual) {
        Map<String, Color> map = new LinkedHashMap<String, Color>();
        map.put("unit", Color.decode(unit));
        map.put("component", Color.decode(component));
        map.put("integration", Color.decode(integration));
        map.put("api", Color.decode(api));
        map.put("e2e", Color.decode(e2e));
        map.put("manual", Color.decode(manual));
        return Collections.unmodifiableMap(map);
    }
}
