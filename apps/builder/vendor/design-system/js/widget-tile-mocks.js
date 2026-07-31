/**
 * Allure 3 chart mocks for .widget-tile — geometry from dashboard-proportions.html
 * (currentStatus / testingPyramid / durations + helpers for layouts).
 *
 * Mark/font scale via --wt-mark-scale / --wt-font-scale (single chrome canon).
 * Tier (--wt-tier / .widget-tile--tier-*) switches chrome structure:
 *   hero | regular | compact | micro — labels, center values, axes.
 * Chart data stays identical to the proportions SSOT. Colours via tokens only.
 */
(function (global) {
  "use strict";

  var STATUS = {
    passed: "var(--color-status-passed-chart)",
    failed: "var(--color-status-failed)",
    broken: "var(--color-status-broken)",
    skipped: "var(--color-status-skipped)",
    unknown: "var(--color-status-unknown)",
  };

  var LAYERS = [
    { k: "manual", n: 2, short: "M", c: "var(--layer-manual)" },
    { k: "e2e", n: 3, short: "E", c: "var(--layer-e2e)" },
    { k: "api", n: 4, short: "A", c: "var(--layer-api)" },
    { k: "integration", n: 5, short: "I", c: "var(--layer-integration)" },
    { k: "component", n: 8, short: "C", c: "var(--layer-component)" },
    { k: "unit", n: 12, short: "U", c: "var(--layer-unit)" },
  ];

  var TIERS = { hero: 1, regular: 1, compact: 1, micro: 1 };

  // Half of Testing pyramid tier rx (regular=8). Not for donut / durationDynamics.
  var CHART_RX = 4;

  var svgOpen =
    '<svg viewBox="0 0 240 240" role="img" preserveAspectRatio="xMidYMid meet" aria-label=';

  function tileVars(el) {
    var tile = el && el.closest ? el.closest(".widget-tile") : null;
    var cs = tile ? getComputedStyle(tile) : null;
    function num(name, fallback) {
      if (!cs) return fallback;
      var n = parseFloat(cs.getPropertyValue(name).trim());
      return isFinite(n) && n > 0 ? n : fallback;
    }
    var tier = "regular";
    if (tile) {
      if (tile.classList.contains("widget-tile--tier-hero")) tier = "hero";
      else if (tile.classList.contains("widget-tile--tier-compact")) tier = "compact";
      else if (tile.classList.contains("widget-tile--tier-micro")) tier = "micro";
      else if (tile.classList.contains("widget-tile--tier-regular")) tier = "regular";
      else {
        var raw = (cs && cs.getPropertyValue("--wt-tier").trim()) || "";
        if (TIERS[raw]) tier = raw;
      }
    }
    return {
      mark: num("--wt-mark-scale", 1),
      font: num("--wt-font-scale", 1),
      tier: tier,
    };
  }

  /**
   * Infer content tier from substrate N and span W×H.
   * hero: full cell on N=1, or span cells ≥ 6, or square span ≥ 3
   * regular: area ≥ 4 (e.g. 2×2)
   * compact: strip / mid (area 2–3)
   * micro: 1×1 on N≥3
   */
  function tierForSpan(n, w, h) {
    var area = w * h;
    if (n <= 1 || (w >= n && h >= n)) return "hero";
    if (area >= 6 || (w >= 3 && h >= 3)) return "hero";
    if (area >= 4) return "regular";
    if (area >= 2) return "compact";
    if (n >= 3) return "micro";
    return "compact";
  }

  /** Current status — Allure 3 donut (34 tests → 30/2/1/1), rounded-cap arcs + gaps.
   * Ring geometry matches dashboard-proportions.html SSOT (sw/r/gap fixed; no mark scale). */
  function donutSvg(host) {
    var v = tileVars(host);
    var r = 106;
    var cx = 120;
    var cy = 120;
    var sw = 18;
    var capDeg = (sw / 2 / r) * (180 / Math.PI);
    var gapDeg = 4;
    var segs = [
      { c: STATUS.passed, n: 30 },
      { c: STATUS.failed, n: 2 },
      { c: STATUS.broken, n: 1 },
      { c: STATUS.skipped, n: 1 },
    ];
    var total = segs.reduce(function (a, x) {
      return a + x.n;
    }, 0);
    var perUnit = (360 - gapDeg * segs.length) / total;

    function pt(deg) {
      var rad = ((deg - 90) * Math.PI) / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    }

    function arc(a0, a1, color) {
      var p0 = pt(a0);
      var p1 = pt(a1);
      var large = a1 - a0 > 180 ? 1 : 0;
      return (
        '<path d="M' +
        p0[0].toFixed(2) +
        " " +
        p0[1].toFixed(2) +
        " A" +
        r +
        " " +
        r +
        " 0 " +
        large +
        " 1 " +
        p1[0].toFixed(2) +
        " " +
        p1[1].toFixed(2) +
        '" fill="none" stroke="' +
        color +
        '" stroke-width="' +
        sw +
        '" stroke-linecap="round" />'
      );
    }

    var cursor = 0;
    var ring = segs
      .map(function (seg) {
        var nominal = seg.n * perUnit;
        var drawn = Math.max(0, nominal - capDeg * 2);
        var start = cursor + (nominal - drawn) / 2;
        cursor += nominal + gapDeg;
        return drawn > 0.01 ? arc(start, start + drawn, seg.c) : arc(start, start + 0.01, seg.c);
      })
      .join("");

    var parts = [svgOpen + '"Current status — 88.24%">' + ring];

    if (v.tier === "micro") {
      var microPct = Math.round(28 * v.font);
      parts.push(
        '<text x="' +
          cx +
          '" y="' +
          (cy + 2) +
          '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
          microPct +
          '" font-weight="800" fill="var(--color-text)">88%</text>'
      );
    } else if (v.tier === "compact") {
      var compactPct = Math.round(32 * v.font);
      parts.push(
        '<text x="' +
          cx +
          '" y="' +
          (cy + 2) +
          '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
          compactPct +
          '" font-weight="800" fill="var(--color-text)">88.24%</text>'
      );
    } else {
      var pctSize = Math.round((v.tier === "hero" ? 34 : 30) * v.font);
      var subSize = Math.round((v.tier === "hero" ? 15 : 14) * v.font);
      var subY = cy + Math.round(24 * Math.min(v.font, 1.15));
      var subLabel = v.tier === "hero" ? "of 34 tests" : "of 34";
      parts.push(
        '<text x="' +
          cx +
          '" y="' +
          (cy + 2) +
          '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
          pctSize +
          '" font-weight="800" fill="var(--color-text)">88.24%</text>'
      );
      parts.push(
        '<text x="' +
          cx +
          '" y="' +
          subY +
          '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
          subSize +
          '" fill="var(--color-text-muted)">' +
          subLabel +
          "</text>"
      );
    }

    parts.push("</svg>");
    return parts.join("");
  }

  /** Testing pyramid — funnel (narrow top → wide bottom), 6 F5 layers. */
  function pyramidSvg(host) {
    var v = tileVars(host);
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = 10;
    var padY = 8;
    // Match durations histogram inter-bar gap (slot × (1 − barFill)).
    var gap = ((240 - 6 * 2) / 10) * (1 - 0.72); // ≈ 6.38
    if (v.tier === "micro") {
      padX = 6;
      padY = 6;
      gap = ((240 - 4 * 2) / 10) * (1 - 0.82); // micro barFill 0.82
    } else if (v.tier === "compact") {
      padX = 8;
      padY = 6;
      gap = ((240 - 4 * 2) / 10) * (1 - 0.72);
    }
    var n = LAYERS.length;
    var bandH = (H - padY * 2 - gap * (n - 1)) / n;
    var cx = W / 2;
    var funnelW = W - padX * 2;
    var minFrac = 0.2;
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var font = Math.round((v.tier === "hero" ? 13 : 12) * v.font);
    // viewBox matches body aspect → 1×2 / 2×1 fill without anamorphic labels.
    var parts = [
      '<svg viewBox="0 0 ' +
        W +
        " " +
        H +
        '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="Testing pyramid">',
    ];

    LAYERS.forEach(function (layer, i) {
      var frac = minFrac + (1 - minFrac) * (i / (n - 1));
      var w = funnelW * frac;
      var y = padY + i * (bandH + gap);
      parts.push(
        '<rect x="' +
          (cx - w / 2).toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          w.toFixed(1) +
          '" height="' +
          bandH.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          layer.c +
          '" />'
      );
      if (v.tier === "micro") {
        /* bands only */
      } else if (v.tier === "compact") {
        var shortFont = Math.round(11 * v.font);
        parts.push(
          '<text x="' +
            cx +
            '" y="' +
            (y + bandH / 2 + shortFont * 0.35).toFixed(1) +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
            shortFont +
            '" font-weight="700" fill="color-mix(in srgb, var(--color-primary-on) 78%, transparent)">' +
            layer.short +
            "</text>"
        );
      } else {
        var label =
          v.tier === "hero"
            ? layer.k + " (" + layer.n + ")"
            : layer.k + " (" + layer.n + ")";
        parts.push(
          '<text x="' +
            cx +
            '" y="' +
            (y + bandH / 2 + font * 0.35).toFixed(1) +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
            font +
            '" font-weight="600" fill="color-mix(in srgb, var(--color-primary-on) 72%, transparent)">' +
            label +
            "</text>"
        );
      }
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /**
   * Plot box matching host body aspect (content box). Chart fills the cell;
   * labels stay unstretched (viewBox aspect = body; meet, not none).
   *
   * Collapsed bodies (GridStack before cellHeight, flex not yet sized) can
   * report aw≫ah → absurd wide viewBox → meet letterboxes into hairlines
   * (testing pyramid). Floor content size + clamp aspect so first paint
   * stays readable until a post-layout refill.
   */
  function plotBox(host, base) {
    base = base || 240;
    var MIN_CONTENT = 24;
    var MAX_ASPECT = 4;
    var body =
      host && host.classList && host.classList.contains("widget-tile__body")
        ? host
        : host && host.closest
          ? host.closest(".widget-tile__body")
          : null;
    if (!body || body.clientWidth < 1 || body.clientHeight < 1) {
      return { W: base, H: base };
    }
    var cs = getComputedStyle(body);
    var aw =
      body.clientWidth -
      (parseFloat(cs.paddingLeft) || 0) -
      (parseFloat(cs.paddingRight) || 0);
    var ah =
      body.clientHeight -
      (parseFloat(cs.paddingTop) || 0) -
      (parseFloat(cs.paddingBottom) || 0);
    if (aw < MIN_CONTENT || ah < MIN_CONTENT) return { W: base, H: base };
    var aspect = aw / ah;
    if (aspect > MAX_ASPECT) aspect = MAX_ASPECT;
    else if (aspect < 1 / MAX_ASPECT) aspect = 1 / MAX_ASPECT;
    if (aspect >= 1) return { W: Math.round(base * aspect), H: base };
    return { W: base, H: Math.round(base / aspect) };
  }


  function svgMeet(label, W, H) {
    return (
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="' +
      label +
      '">'
    );
  }

  /** Histogram/bar width: thicken via mark but keep ≥8% slot gutter. */
  function barWForSlot(slot, fill, mark, tier) {
    var markCap = tier === "micro" ? 1.35 : tier === "compact" ? 1.25 : 1.15;
    return Math.min(slot * fill * Math.min(mark, markCap), slot * 0.92);
  }

  /**
   * Vertical bar path with independent top/bottom radii.
   * Prefer over clip-path: CSS transform on ancestors (size-ladder scale)
   * drops url(#clip) rounding — rect/path rx survive.
   */
  function vBarPath(x, y, w, h, rTop, rBot) {
    if (w < 0.5 || h < 0.5) return "";
    rTop = Math.max(0, Math.min(rTop || 0, w / 2, h / 2));
    rBot = Math.max(0, Math.min(rBot || 0, w / 2, h / 2));
    var x2 = x + w;
    var y2 = y + h;
    var d = "M" + (x + rTop).toFixed(1) + "," + y.toFixed(1);
    d += "L" + (x2 - rTop).toFixed(1) + "," + y.toFixed(1);
    if (rTop > 0) {
      d +=
        "A" +
        rTop.toFixed(1) +
        "," +
        rTop.toFixed(1) +
        " 0 0 1 " +
        x2.toFixed(1) +
        "," +
        (y + rTop).toFixed(1);
    }
    d += "L" + x2.toFixed(1) + "," + (y2 - rBot).toFixed(1);
    if (rBot > 0) {
      d +=
        "A" +
        rBot.toFixed(1) +
        "," +
        rBot.toFixed(1) +
        " 0 0 1 " +
        (x2 - rBot).toFixed(1) +
        "," +
        y2.toFixed(1);
    }
    d += "L" + (x + rBot).toFixed(1) + "," + y2.toFixed(1);
    if (rBot > 0) {
      d +=
        "A" +
        rBot.toFixed(1) +
        "," +
        rBot.toFixed(1) +
        " 0 0 1 " +
        x.toFixed(1) +
        "," +
        (y2 - rBot).toFixed(1);
    }
    d += "L" + x.toFixed(1) + "," + (y + rTop).toFixed(1);
    if (rTop > 0) {
      d +=
        "A" +
        rTop.toFixed(1) +
        "," +
        rTop.toFixed(1) +
        " 0 0 1 " +
        (x + rTop).toFixed(1) +
        "," +
        y.toFixed(1);
    }
    return d + "Z";
  }

  /** Fully rounded rect path (horizontal / funnel bands). */
  function roundRectPath(x, y, w, h, rx) {
    return vBarPath(x, y, w, h, rx, rx);
  }

  /** Horizontal bar path with independent left/right radii. */
  function hBarPath(x, y, w, h, rLeft, rRight) {
    if (w < 0.5 || h < 0.5) return "";
    rLeft = Math.max(0, Math.min(rLeft || 0, w / 2, h / 2));
    rRight = Math.max(0, Math.min(rRight || 0, w / 2, h / 2));
    var x2 = x + w;
    var y2 = y + h;
    var d = "M" + (x + rLeft).toFixed(1) + "," + y.toFixed(1);
    d += "L" + (x2 - rRight).toFixed(1) + "," + y.toFixed(1);
    if (rRight > 0) {
      d +=
        "A" +
        rRight.toFixed(1) +
        "," +
        rRight.toFixed(1) +
        " 0 0 1 " +
        x2.toFixed(1) +
        "," +
        (y + rRight).toFixed(1);
    }
    d += "L" + x2.toFixed(1) + "," + (y2 - rRight).toFixed(1);
    if (rRight > 0) {
      d +=
        "A" +
        rRight.toFixed(1) +
        "," +
        rRight.toFixed(1) +
        " 0 0 1 " +
        (x2 - rRight).toFixed(1) +
        "," +
        y2.toFixed(1);
    }
    d += "L" + (x + rLeft).toFixed(1) + "," + y2.toFixed(1);
    if (rLeft > 0) {
      d +=
        "A" +
        rLeft.toFixed(1) +
        "," +
        rLeft.toFixed(1) +
        " 0 0 1 " +
        x.toFixed(1) +
        "," +
        (y2 - rLeft).toFixed(1);
    }
    d += "L" + x.toFixed(1) + "," + (y + rLeft).toFixed(1);
    if (rLeft > 0) {
      d +=
        "A" +
        rLeft.toFixed(1) +
        "," +
        rLeft.toFixed(1) +
        " 0 0 1 " +
        (x + rLeft).toFixed(1) +
        "," +
        y.toFixed(1);
    }
    return d + "Z";
  }

  /** Durations histogram — sparse Allure buckets, tallest bar fills plot height. */
  function durationsSvg(host) {
    var v = tileVars(host);
    var heights = [150, 96, 92, 55, 0, 0, 40, 0, 0, 78];
    var labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var showAxis = v.tier === "hero" || v.tier === "regular";
    var padT = 8;
    var padB = showAxis ? 22 : 10;
    var padX = 6;
    if (v.tier === "micro") {
      padT = 4;
      padB = 4;
      padX = 4;
    } else if (v.tier === "compact") {
      padT = 6;
      padB = 6;
      padX = 4;
    }
    var plotH = H - padT - padB;
    var n = heights.length;
    var slot = (W - padX * 2) / n;
    // Micro fill 0.82 × --wt-mark-scale 1.28 overshoots the slot and fuses
    // adjacent bars; thicken via mark but keep ≥8% column gutter.
    var fill = v.tier === "micro" ? 0.82 : 0.72;
    var markCap = v.tier === "micro" ? 1.35 : v.tier === "compact" ? 1.25 : 1.15;
    var barW = Math.min(slot * fill * Math.min(v.mark, markCap), slot * 0.92);
    var maxH = heights.reduce(function (m, h) {
      return Math.max(m, h);
    }, 1);
    // viewBox matches body aspect → meet fills strip without anamorphic text.
    var parts = [
      '<svg viewBox="0 0 ' +
        W +
        " " +
        H +
        '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="Durations (s)">',
    ];

    heights.forEach(function (h, i) {
      if (h <= 0) return;
      var barH = (h / maxH) * plotH;
      var x = padX + i * slot + (slot - barW) / 2;
      var y = padT + plotH - barH;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          barW.toFixed(1) +
          '" height="' +
          barH.toFixed(1) +
          '" rx="' +
          (v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX) +
          '" fill="var(--color-info)" />'
      );
    });

    if (showAxis) {
      var tickFont = Math.round((v.tier === "hero" ? 11 : 10) * v.font);
      var axisY = H - Math.round(padB * 0.35);
      labels.forEach(function (lab, i) {
        if (v.tier === "regular" && i % 2 !== 0) return;
        var tx = padX + i * slot + slot / 2;
        parts.push(
          '<text x="' +
            tx.toFixed(1) +
            '" y="' +
            axisY +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="' +
            tickFont +
            '" fill="var(--color-text-muted)">' +
            lab +
            "</text>"
        );
      });
    }

    parts.push("</svg>");
    return parts.join("");
  }

  /** Status dynamics — percent-stacked status bars over builds. */
  function statusDynamicsSvg(host) {
    var v = tileVars(host);
    var builds = [
      { passed: 26, broken: 3, failed: 5 },
      { passed: 28, broken: 2, failed: 4 },
      { passed: 27, broken: 4, failed: 3 },
      { passed: 30, broken: 2, failed: 2 },
      { passed: 29, broken: 3, failed: 2 },
      { passed: 31, broken: 1, failed: 2 },
      { passed: 30, broken: 2, failed: 1 },
      { passed: 30, broken: 1, failed: 3 },
    ];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padT = v.tier === "micro" ? 4 : 12;
    var padB = v.tier === "micro" ? 4 : 14;
    var padX = 6;
    var plotH = H - padT - padB;
    var n = builds.length;
    var slot = (W - padX * 2) / n;
    // Micro fill × mark-scale must keep ≥8% column gutter (durations canon).
    var fill = v.tier === "micro" ? 0.85 : 0.72;
    var markCap = v.tier === "micro" ? 1.35 : v.tier === "compact" ? 1.25 : 1.15;
    var barW = Math.min(slot * fill * Math.min(v.mark, markCap), slot * 0.92);
    var parts = [
      '<svg viewBox="0 0 ' +
        W +
        " " +
        H +
        '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="Status dynamics">',
    ];

    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    builds.forEach(function (b, i) {
      var total = b.passed + b.broken + b.failed;
      var x = padX + i * slot + (slot - barW) / 2;
      var y = padT + plotH;
      var segs = [
        ["passed", b.passed],
        ["broken", b.broken],
        ["failed", b.failed],
      ].filter(function (seg) {
        return seg[1] > 0;
      });
      segs.forEach(function (seg, si) {
        var h = (seg[1] / total) * plotH;
        y -= h;
        var rBot = si === 0 ? rx : 0;
        var rTop = si === segs.length - 1 ? rx : 0;
        parts.push(
          '<path d="' +
            vBarPath(x, y, barW, h, rTop, rBot) +
            '" fill="' +
            STATUS[seg[0]] +
            '" />'
        );
      });
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /** Horizontal bars (severity / categories). */
  function hBarsSvg(host, label, rows) {
    var v = tileVars(host);
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = v.tier === "micro" ? 6 : 10;
    var padY = v.tier === "micro" ? 6 : 12;
    var gap = v.tier === "micro" ? 6 : 10;
    var capH = v.tier === "micro" ? 0 : v.tier === "compact" ? 12 : 15;
    var n = rows.length;
    var rowH = (H - padY * 2 - gap * (n - 1)) / n;
    var max = rows.reduce(function (m, r) {
      return Math.max(m, r.n);
    }, 1);
    var barMax = W - padX * 2;
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    // viewBox matches body aspect → 1×2 / 2×1 fill without anamorphic labels.
    var parts = [
      '<svg viewBox="0 0 ' +
        W +
        " " +
        H +
        '" role="img" preserveAspectRatio="xMidYMid meet" aria-label="' +
        label +
        '">',
    ];
    rows.forEach(function (r, i) {
      var y = padY + i * (rowH + gap);
      var w = (r.n / max) * barMax;
      if (capH > 0 && v.tier !== "micro") {
        var capY = y + (v.tier === "compact" ? 9 : 11);
        var font = Math.round((v.tier === "compact" ? 10 : 11) * v.font);
        parts.push(
          '<text x="' +
            padX +
            '" y="' +
            capY.toFixed(1) +
            '" font-family="var(--font-sans)" font-size="' +
            font +
            '" fill="var(--color-text-muted)">' +
            r.k +
            "</text>"
        );
        if (v.tier !== "compact") {
          parts.push(
            '<text x="' +
              (W - padX) +
              '" y="' +
              capY.toFixed(1) +
              '" text-anchor="end" font-family="var(--font-sans)" font-size="' +
              font +
              '" font-weight="600" fill="var(--color-text)">' +
              r.n +
              "</text>"
          );
        }
      }
      var barY = y + capH;
      var barH = rowH - capH;
      parts.push(
        '<rect x="' +
          padX +
          '" y="' +
          barY.toFixed(1) +
          '" width="' +
          Math.max(3, w).toFixed(1) +
          '" height="' +
          barH.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          r.c +
          '" />'
      );
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /** Test results by severities. */
  function severitySvg(host) {
    return hBarsSvg(host, "Severity", [
      { k: "blocker", n: 1, c: "#c0392b" },
      { k: "critical", n: 3, c: STATUS.failed },
      { k: "normal", n: 16, c: "#ff8c42" },
      { k: "minor", n: 9, c: STATUS.broken },
      { k: "trivial", n: 5, c: STATUS.skipped },
    ]);
  }

  /** Success-rate distribution — histogram; active buckets fill plot width (jar parity). */
  function successRateSvg(host) {
    var v = tileVars(host);
    var buckets = [0, 0, 0, 0, 0, 1, 5, 16, 10, 2];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padT = v.tier === "micro" ? 4 : 8;
    var padB = v.tier === "micro" ? 4 : 10;
    var padX = v.tier === "micro" ? 4 : 6;
    var plotH = H - padT - padB;
    var bins = buckets.length;
    var active = [];
    var maxCount = 1;
    for (var i = 0; i < bins; i++) {
      if (buckets[i] > 0) {
        active.push(i);
        maxCount = Math.max(maxCount, buckets[i]);
      }
    }
    var parts = [svgMeet("Success rate distribution", W, H)];
    if (!active.length) {
      parts.push("</svg>");
      return parts.join("");
    }
    function bucketColor(index) {
      var t = bins <= 1 ? 1 : index / (bins - 1);
      return "hsl(" + Math.round(t * 120) + ", 62%, 52%)";
    }
    var chartWidth = W - padX * 2;
    var activeCount = active.length;
    var slot = Math.max(1, chartWidth / activeCount);
    var fill = v.tier === "micro" ? 0.85 : 0.72;
    var markCap = v.tier === "micro" ? 1.35 : v.tier === "compact" ? 1.25 : 1.15;
    var barW = Math.min(slot * fill * Math.min(v.mark, markCap), slot * 0.92);
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    active.forEach(function (bucketIndex, j) {
      var count = buckets[bucketIndex];
      var barH = Math.max(1, (count / maxCount) * plotH);
      var x = padX + j * slot + (slot - barW) / 2;
      var y = padT + plotH - barH;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          barW.toFixed(1) +
          '" height="' +
          barH.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          bucketColor(bucketIndex) +
          '" />'
      );
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /** Stability distribution — bars + 90% threshold. */
  function stabilitySvg(host) {
    var v = tileVars(host);
    var vals = [100, 96, 88, 92, 100, 84, 98, 90, 100, 78];
    var threshold = 90;
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padT = v.tier === "micro" ? 4 : 12;
    var padB = v.tier === "micro" ? 4 : 14;
    var padX = v.tier === "micro" ? 4 : 10;
    var plotH = H - padT - padB;
    var n = vals.length;
    var slot = (W - padX * 2) / n;
    var barW = barWForSlot(slot, v.tier === "micro" ? 0.82 : 0.72, v.mark, v.tier);
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var parts = [svgMeet("Stability distribution", W, H)];
    vals.forEach(function (val, i) {
      var h = (val / 100) * plotH;
      var x = padX + i * slot + (slot - barW) / 2;
      var y = padT + plotH - h;
      var c = val >= threshold ? STATUS.passed : val >= 80 ? STATUS.broken : STATUS.failed;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          barW.toFixed(1) +
          '" height="' +
          h.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          c +
          '" />'
      );
    });
    if (v.tier !== "micro") {
      var ty = padT + plotH - (threshold / 100) * plotH;
      parts.push(
        '<line x1="' +
          padX +
          '" y1="' +
          ty.toFixed(1) +
          '" x2="' +
          (W - padX) +
          '" y2="' +
          ty.toFixed(1) +
          '" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-dasharray="4 3" />'
      );
      if (v.tier === "hero" || v.tier === "regular") {
        parts.push(
          '<text x="' +
            (W - padX) +
            '" y="' +
            (ty - 4).toFixed(1) +
            '" text-anchor="end" font-family="var(--font-sans)" font-size="10" fill="var(--color-text-muted)">90%</text>'
        );
      }
    }
    parts.push("</svg>");
    return parts.join("");
  }

  /** Problems distribution heatmap (by environment). */
  function problemsSvg(host) {
    var v = tileVars(host);
    var rows = ["chrome", "firefox", "safari"];
    var data = [
      [0, 1, 0, 2, 0, 1],
      [1, 0, 3, 0, 1, 0],
      [0, 2, 1, 1, 4, 0],
    ];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var showScale = v.tier === "hero" || v.tier === "regular";
    // Compact: thin strip, no title. Micro: no scale (tile too tight).
    // Hero/regular: title + bar + ticks — reserve enough so "Value" clear of cells.
    var scaleH =
      v.tier === "micro" ? 0 : v.tier === "compact" ? 14 : showScale ? 42 : 0;
    var padY = v.tier === "micro" ? 6 : 10;
    var padBot = padY + scaleH;
    var labelW = v.tier === "micro" ? 0 : 54;
    var padR = 8;
    var gap = 4;
    var cols = data[0].length;
    var cellW = (W - labelW - padR - gap * (cols - 1)) / cols;
    var cellH = (H - padY - padBot - gap * (rows.length - 1)) / rows.length;
    var max = 4;
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    function heat(val) {
      if (val === 0) return "var(--color-border, rgba(255,255,255,.12))";
      var t = val / max;
      return (
        "hsl(" +
        Math.round(12 - 12 * t) +
        ", " +
        Math.round(60 + 30 * t) +
        "%, " +
        Math.round(62 - 14 * t) +
        "%)"
      );
    }
    function heatT(t) {
      t = Math.max(0, Math.min(1, t));
      return (
        "hsl(" +
        Math.round(12 - 12 * t) +
        ", " +
        Math.round(60 + 30 * t) +
        "%, " +
        Math.round(62 - 14 * t) +
        "%)"
      );
    }
    var parts = [svgMeet("Problems distribution", W, H)];
    rows.forEach(function (label, ri) {
      var y = padY + ri * (cellH + gap);
      if (labelW > 0) {
        parts.push(
          '<text x="' +
            (labelW - 8) +
            '" y="' +
            (y + cellH / 2 + 4).toFixed(1) +
            '" text-anchor="end" font-family="var(--font-sans)" font-size="10" fill="var(--color-text-muted)">' +
            label +
            "</text>"
        );
      }
      data[ri].forEach(function (val, ci) {
        var x = labelW + ci * (cellW + gap);
        parts.push(
          '<rect x="' +
            x.toFixed(1) +
            '" y="' +
            y.toFixed(1) +
            '" width="' +
            cellW.toFixed(1) +
            '" height="' +
            cellH.toFixed(1) +
            '" rx="' +
            rx +
            '" fill="' +
            heat(val) +
            '" />'
        );
        if (val > 0 && v.tier !== "micro") {
          parts.push(
            '<text x="' +
              (x + cellW / 2).toFixed(1) +
              '" y="' +
              (y + cellH / 2 + 4).toFixed(1) +
              '" text-anchor="middle" font-family="var(--font-sans)" font-size="10" font-weight="600" fill="rgba(0,0,0,.7)">' +
              val +
              "</text>"
          );
        }
      });
    });
    if (scaleH > 0) {
      // Unique grad id — size-ladder duplicates many SVGs in one document.
      var gradId = "wt-heat-" + Math.random().toString(36).slice(2, 9);
      var scaleX = labelW;
      var scaleW = W - labelW - padR;
      // Sit scale in the reserved padBot band, clear of the last heatmap row.
      var bandTop = H - padBot + 8;
      var barH = v.tier === "compact" ? 6 : 8;
      var titleGap = showScale ? 14 : 0;
      var barY = bandTop + titleGap;
      var stops = [0, 0.25, 0.5, 0.75, 1]
        .map(function (t) {
          return (
            '<stop offset="' +
            Math.round(t * 100) +
            '%" stop-color="' +
            heatT(t) +
            '"/>'
          );
        })
        .join("");
      parts.push(
        "<defs><linearGradient id=\"" +
          gradId +
          '" x1="0" y1="0" x2="1" y2="0">' +
          stops +
          "</linearGradient></defs>"
      );
      if (showScale) {
        parts.push(
          '<text x="' +
            (scaleX + scaleW / 2).toFixed(1) +
            '" y="' +
            (bandTop + 9).toFixed(1) +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="10" fill="var(--color-text-muted)">Value</text>'
        );
      }
      parts.push(
        '<rect x="' +
          scaleX.toFixed(1) +
          '" y="' +
          barY.toFixed(1) +
          '" width="' +
          scaleW.toFixed(1) +
          '" height="' +
          barH +
          '" rx="2" fill="url(#' +
          gradId +
          ')"/>'
      );
      if (showScale) {
        var ticks = [
          { t: 0, lab: "0" },
          { t: 0.5, lab: String(max / 2) },
          { t: 1, lab: String(max) },
        ];
        ticks.forEach(function (tick) {
          var tx = scaleX + tick.t * scaleW;
          parts.push(
            '<line x1="' +
              tx.toFixed(1) +
              '" y1="' +
              (barY + barH).toFixed(1) +
              '" x2="' +
              tx.toFixed(1) +
              '" y2="' +
              (barY + barH + 3).toFixed(1) +
              '" stroke="var(--color-text-muted)" stroke-width="1"/>'
          );
          parts.push(
            '<text x="' +
              tx.toFixed(1) +
              '" y="' +
              (barY + barH + 12).toFixed(1) +
              '" text-anchor="middle" font-family="var(--font-sans)" font-size="9" fill="var(--color-text-muted)">' +
              tick.lab +
              "</text>"
          );
        });
      }
    }
    parts.push("</svg>");
    return parts.join("");
  }

  /** Status transitions — diverging bars around zero. */
  function statusTransitionsSvg(host) {
    var v = tileVars(host);
    var builds = [
      { fixed: 4, regressed: 2, malfunctioned: 1 },
      { fixed: 3, regressed: 1, malfunctioned: 0 },
      { fixed: 5, regressed: 2, malfunctioned: 1 },
      { fixed: 2, regressed: 3, malfunctioned: 1 },
      { fixed: 6, regressed: 1, malfunctioned: 0 },
      { fixed: 3, regressed: 2, malfunctioned: 2 },
      { fixed: 4, regressed: 1, malfunctioned: 0 },
      { fixed: 5, regressed: 2, malfunctioned: 1 },
    ];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = v.tier === "micro" ? 4 : 10;
    var padT = v.tier === "micro" ? 4 : 12;
    var padB = v.tier === "micro" ? 4 : 12;
    var mid = padT + (H - padT - padB) / 2;
    var upH = mid - padT;
    var downH = H - padB - mid;
    var maxUp = 6;
    var maxDown = 5;
    var n = builds.length;
    var slot = (W - padX * 2) / n;
    var barW = barWForSlot(slot, v.tier === "micro" ? 0.8 : 0.66, v.mark, v.tier);
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var parts = [svgMeet("Status transitions", W, H)];
    builds.forEach(function (b, i) {
      var x = padX + i * slot + (slot - barW) / 2;
      var fh = (b.fixed / maxUp) * upH;
      // Round only the outer (top) end — flush square at the zero axis.
      parts.push(
        '<path d="' +
          vBarPath(x, mid - fh, barW, fh, rx, 0) +
          '" fill="' +
          STATUS.passed +
          '" />'
      );
      var downTotal = b.regressed + b.malfunctioned;
      if (downTotal > 0) {
        var y = mid;
        var downSegs = [
          ["failed", b.regressed],
          ["orange", b.malfunctioned],
        ].filter(function (seg) {
          return seg[1] > 0;
        });
        downSegs.forEach(function (seg, si) {
          var h = (seg[1] / maxDown) * downH;
          var color = seg[0] === "orange" ? "#ff8200" : STATUS.failed;
          // Square at mid; round only the outer (bottom) tip of the stack.
          var rBot = si === downSegs.length - 1 ? rx : 0;
          parts.push(
            '<path d="' +
              vBarPath(x, y, barW, h, 0, rBot) +
              '" fill="' +
              color +
              '" />'
          );
          y += h;
        });
      }
    });
    parts.push(
      '<line x1="' +
        padX +
        '" y1="' +
        mid.toFixed(1) +
        '" x2="' +
        (W - padX) +
        '" y2="' +
        mid.toFixed(1) +
        '" stroke="var(--color-text-muted)" stroke-width="1" />'
    );
    parts.push("</svg>");
    return parts.join("");
  }

  /** Test base growth — added↑ / removed↓. */
  function testBaseGrowthSvg(host) {
    var v = tileVars(host);
    var builds = [
      { added: 5, removed: 1 },
      { added: 3, removed: 0 },
      { added: 6, removed: 2 },
      { added: 2, removed: 1 },
      { added: 4, removed: 0 },
      { added: 7, removed: 3 },
      { added: 3, removed: 1 },
      { added: 5, removed: 2 },
    ];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = v.tier === "micro" ? 4 : 10;
    var padT = v.tier === "micro" ? 4 : 12;
    var padB = v.tier === "micro" ? 4 : 12;
    var mid = padT + (H - padT - padB) * 0.62;
    var upH = mid - padT;
    var downH = H - padB - mid;
    var maxUp = 7;
    var maxDown = 3;
    var n = builds.length;
    var slot = (W - padX * 2) / n;
    var barW = barWForSlot(slot, v.tier === "micro" ? 0.8 : 0.66, v.mark, v.tier);
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var parts = [svgMeet("Test base growth", W, H)];
    builds.forEach(function (b, i) {
      var x = padX + i * slot + (slot - barW) / 2;
      var ah = (b.added / maxUp) * upH;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          (mid - ah).toFixed(1) +
          '" width="' +
          barW.toFixed(1) +
          '" height="' +
          ah.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          STATUS.passed +
          '" />'
      );
      var rh = (b.removed / maxDown) * downH;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          mid.toFixed(1) +
          '" width="' +
          barW.toFixed(1) +
          '" height="' +
          rh.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          STATUS.failed +
          '" />'
      );
    });
    parts.push(
      '<line x1="' +
        padX +
        '" y1="' +
        mid.toFixed(1) +
        '" x2="' +
        (W - padX) +
        '" y2="' +
        mid.toFixed(1) +
        '" stroke="var(--color-text-muted)" stroke-width="1" />'
    );
    parts.push("</svg>");
    return parts.join("");
  }

  /** Status age pyramid — funnel by age × status. */
  function statusAgePyramidSvg(host) {
    var v = tileVars(host);
    var buckets = [
      { age: "1 build", failed: 6, broken: 3, skipped: 2, unknown: 1 },
      { age: "2", failed: 4, broken: 2, skipped: 1, unknown: 1 },
      { age: "3–4", failed: 3, broken: 1, skipped: 1, unknown: 0 },
      { age: "5–7", failed: 2, broken: 1, skipped: 0, unknown: 0 },
      { age: "8+", failed: 1, broken: 0, skipped: 0, unknown: 0 },
    ];
    var order = ["failed", "broken", "skipped", "unknown"];
    var colorOf = {
      failed: STATUS.failed,
      broken: STATUS.broken,
      skipped: STATUS.skipped,
      unknown: STATUS.unknown,
    };
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = v.tier === "micro" ? 6 : 12;
    var padY = v.tier === "micro" ? 6 : 12;
    var gap = v.tier === "micro" ? 4 : 8;
    var n = buckets.length;
    var bandH = (H - padY * 2 - gap * (n - 1)) / n;
    var cx = W / 2;
    var fullW = W - padX * 2;
    var totals = buckets.map(function (b) {
      return b.failed + b.broken + b.skipped + b.unknown;
    });
    var max = totals.reduce(function (m, t) {
      return Math.max(m, t);
    }, 1);
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var parts = [svgMeet("Status age pyramid", W, H)];
    buckets.forEach(function (b, i) {
      var total = totals[i];
      var w = (total / max) * fullW;
      var y = padY + i * (bandH + gap);
      var x0 = cx - w / 2;
      var x = x0;
      var segs = [];
      order.forEach(function (k) {
        if (!b[k]) return;
        segs.push({ k: k, sw: (b[k] / total) * w });
      });
      segs.forEach(function (seg, si) {
        var rL = si === 0 ? rx : 0;
        var rR = si === segs.length - 1 ? rx : 0;
        parts.push(
          '<path d="' +
            hBarPath(x, y, seg.sw, bandH, rL, rR) +
            '" fill="' +
            colorOf[seg.k] +
            '" />'
        );
        x += seg.sw;
      });
      if (v.tier !== "micro") {
        parts.push(
          '<text x="' +
            cx +
            '" y="' +
            (y + bandH / 2 + 4).toFixed(1) +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="11" font-weight="600" fill="rgba(0,0,0,.72)">' +
            b.age +
            "</text>"
        );
      }
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /** Coverage diff map — treemap by added/removed/unchanged. */
  function coverageDiffSvg(host) {
    var v = tileVars(host);
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var sx = W / 240;
    var sy = H / 240;
    var cells = [
      { x: 0, y: 0, w: 130, h: 138, d: "added", n: "auth" },
      { x: 130, y: 0, w: 110, h: 80, d: "unchanged", n: "cart" },
      { x: 130, y: 80, w: 110, h: 58, d: "removed", n: "search" },
      { x: 0, y: 138, w: 82, h: 102, d: "added", n: "user" },
      { x: 82, y: 138, w: 88, h: 102, d: "unchanged", n: "pay" },
      { x: 170, y: 138, w: 70, h: 102, d: "removed", n: "admin" },
    ];
    var diffColor = {
      added: "#6bbf59",
      removed: "#fd5a3e",
      unchanged: "var(--color-border, rgba(255,255,255,.14))",
    };
    var rx = v.tier === "micro" ? Math.max(2, CHART_RX / 2) : CHART_RX;
    var parts = [svgMeet("Coverage diff map", W, H)];
    cells.forEach(function (c) {
      var x = c.x * sx;
      var y = c.y * sy;
      var w = c.w * sx;
      var h = c.h * sy;
      parts.push(
        '<rect x="' +
          x.toFixed(1) +
          '" y="' +
          y.toFixed(1) +
          '" width="' +
          w.toFixed(1) +
          '" height="' +
          h.toFixed(1) +
          '" rx="' +
          rx +
          '" fill="' +
          diffColor[c.d] +
          '" stroke="var(--color-surface)" stroke-width="3" />'
      );
      if (v.tier !== "micro" && w > 55 && h > 40) {
        parts.push(
          '<text x="' +
            (x + w / 2).toFixed(1) +
            '" y="' +
            (y + h / 2 - 2).toFixed(1) +
            '" text-anchor="middle" font-family="var(--font-sans)" font-size="11" font-weight="600" fill="rgba(0,0,0,.7)">' +
            c.n +
            "</text>"
        );
        if (v.tier !== "compact") {
          parts.push(
            '<text x="' +
              (x + w / 2).toFixed(1) +
              '" y="' +
              (y + h / 2 + 13).toFixed(1) +
              '" text-anchor="middle" font-family="var(--font-sans)" font-size="10" fill="rgba(0,0,0,.55)">' +
              c.d +
              "</text>"
          );
        }
      }
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /**
   * Durations by layer — avg seconds per layer (horizontal pills).
   * Collage canon: Java DurationsPanel / core drawLayerAverages (not stacked hist).
   * Top → bottom matches Testing pyramid (manual … unit), all 6 F5 layers.
   */
  function durationsByLayerSvg(host) {
    var v = tileVars(host);
    var avgs = {
      manual: 4.2,
      e2e: 2.8,
      api: 1.6,
      integration: 0.9,
      component: 0.4,
      unit: 0.15,
    };
    var rows = LAYERS.map(function (l) {
      return { k: l.k, n: avgs[l.k], c: l.c };
    });
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padX = v.tier === "micro" ? 4 : 10;
    var padY = v.tier === "micro" ? 4 : 10;
    var n = rows.length;
    var plotH = H - padY * 2;
    var rowH = plotH / n;
    var showLabels = v.tier !== "micro";
    var labelW = showLabels ? Math.min(90, Math.floor((W - padX * 2) / 3)) : 0;
    var valueW = showLabels ? (v.tier === "compact" ? 28 : 36) : 0;
    var barArea = Math.max(1, W - padX * 2 - labelW - valueW);
    var maxAvg = rows.reduce(function (m, r) {
      return Math.max(m, r.n);
    }, 0.001);
    var barH = Math.max(
      6,
      Math.floor(rowH * (v.tier === "micro" ? 0.7 : v.tier === "compact" ? 0.5 : 0.55))
    );
    var font = Math.round(
      (v.tier === "compact" ? 9 : v.tier === "hero" ? 12 : 11) * v.font
    );
    var parts = [svgMeet("Durations by layer (s)", W, H)];
    rows.forEach(function (r, i) {
      var rowY = padY + i * rowH;
      var baseline = rowY + rowH * 0.7;
      var barY = rowY + (rowH - barH) / 2;
      var barW = Math.max(2, Math.floor((r.n / maxAvg) * barArea));
      var barX = padX + labelW;
      var rPill = barH / 2;
      if (showLabels) {
        parts.push(
          '<text x="' +
            padX +
            '" y="' +
            baseline.toFixed(1) +
            '" font-family="var(--font-sans)" font-size="' +
            font +
            '" fill="var(--color-text)">' +
            (v.tier === "compact" ? r.k.slice(0, 3) : r.k) +
            "</text>"
        );
      }
      parts.push(
        '<path d="' +
          hBarPath(barX, barY, barW, barH, rPill, rPill) +
          '" fill="' +
          r.c +
          '" />'
      );
      if (showLabels && v.tier !== "compact") {
        parts.push(
          '<text x="' +
            (barX + barW + 6).toFixed(1) +
            '" y="' +
            baseline.toFixed(1) +
            '" font-family="var(--font-sans)" font-size="' +
            font +
            '" fill="var(--color-text)">' +
            r.n.toFixed(1) +
            "</text>"
        );
      }
    });
    parts.push("</svg>");
    return parts.join("");
  }

  /** Durations dynamics — avg duration line + area. */
  function durationTrendSvg(host) {
    var v = tileVars(host);
    var vals = [12.4, 10.1, 11.2, 8.6, 9.0, 7.4, 8.1, 6.9, 7.2, 6.1];
    var box = plotBox(host, 240);
    var W = box.W;
    var H = box.H;
    var padT = v.tier === "micro" ? 8 : 16;
    var padB = v.tier === "micro" ? 8 : 18;
    var padX = v.tier === "micro" ? 8 : 14;
    var plotW = W - padX * 2;
    var plotH = H - padT - padB;
    var max = 13;
    var min = 0;
    var n = vals.length;
    var pts = vals.map(function (val, i) {
      var x = padX + (i / (n - 1)) * plotW;
      var y = padT + (1 - (val - min) / (max - min)) * plotH;
      return [x, y];
    });
    var line = pts
      .map(function (p) {
        return p[0].toFixed(1) + "," + p[1].toFixed(1);
      })
      .join(" ");
    var area =
      "M" +
      padX.toFixed(1) +
      "," +
      (padT + plotH).toFixed(1) +
      " L" +
      line.replace(/ /g, " L") +
      " L" +
      (padX + plotW).toFixed(1) +
      "," +
      (padT + plotH).toFixed(1) +
      " Z";
    var sw = (2.5 * v.mark * (v.tier === "micro" ? 1.2 : 1)).toFixed(1);
    var r = (3 * Math.min(v.mark, 1.2) * (v.tier === "compact" || v.tier === "micro" ? 1.15 : 1)).toFixed(1);
    var parts = [svgMeet("Durations dynamics", W, H)];
    if (v.tier !== "micro") {
      parts.push('<path d="' + area + '" fill="var(--color-info)" fill-opacity="0.16" />');
    }
    parts.push(
      '<polyline points="' +
        line +
        '" fill="none" stroke="var(--color-info)" stroke-width="' +
        sw +
        '" stroke-linejoin="round" stroke-linecap="round" />'
    );
    if (v.tier !== "micro") {
      pts.forEach(function (p) {
        parts.push(
          '<circle cx="' +
            p[0].toFixed(1) +
            '" cy="' +
            p[1].toFixed(1) +
            '" r="' +
            r +
            '" fill="var(--color-info)" />'
        );
      });
    }
    parts.push("</svg>");
    return parts.join("");
  }

  var RENDERERS = {
    currentStatus: donutSvg,
    donut: donutSvg,
    testingPyramid: pyramidSvg,
    pyramid: pyramidSvg,
    testResultSeverities: severitySvg,
    statusDynamics: statusDynamicsSvg,
    statusTransitions: statusTransitionsSvg,
    testBaseGrowthDynamics: testBaseGrowthSvg,
    coverageDiff: coverageDiffSvg,
    successRateDistribution: successRateSvg,
    problemsDistribution: problemsSvg,
    stabilityDistribution: stabilitySvg,
    durations: durationsSvg,
    durationDynamics: durationTrendSvg,
    "duration-trend": durationTrendSvg,
    statusAgePyramid: statusAgePyramidSvg,
  };

  /**
   * Resolve ChartType + variant attrs → renderer.
   * Aliases: donut → currentStatus; pyramid → testingPyramid;
   * duration-trend → durationDynamics. Variants: groupBy / by.
   */
  function resolveKind(kind, variant) {
    var k = (kind || "").trim();
    if (k === "donut") k = "currentStatus";
    if (k === "pyramid") k = "testingPyramid";
    if (k === "duration-trend") k = "durationDynamics";
    var groupBy = (variant && variant.groupBy) || "";
    if (k === "durations" && (groupBy === "layer" || groupBy === "label-name:layer")) {
      return { key: "durations", render: durationsByLayerSvg, variant: variant };
    }
    return { key: k, render: RENDERERS[k], variant: variant };
  }

  /**
   * SSOT 17 slots ↔ stacks/.../awesome-charts.mjs (length 17).
   * Unique ChartType = 13; stability×4 + durations×2 share renderer + variant.
   */
  var CATALOG = [
    { type: "currentStatus", title: "Current status", dots: ["red", "yellow", "gray", "green"] },
    { type: "testingPyramid", title: "Testing pyramid", dots: ["red", "orange", "yellow", "purple", "green", "blue"] },
    { type: "testResultSeverities", title: "Results by severity", dots: ["red", "orange", "yellow", "gray"] },
    { type: "statusDynamics", title: "Status dynamics", dots: ["red", "yellow", "green"] },
    { type: "statusTransitions", title: "Status transitions", dots: ["red", "orange", "green"] },
    { type: "testBaseGrowthDynamics", title: "Test base growth", dots: ["red", "green"] },
    { type: "coverageDiff", title: "Coverage diff", dots: ["red", "green", "gray"] },
    { type: "successRateDistribution", title: "Success rate", dots: ["red", "yellow", "green"] },
    { type: "problemsDistribution", by: "environment", title: "Problems by environment", dots: ["red", "orange", "gray"] },
    {
      type: "stabilityDistribution",
      groupBy: "label-name:component",
      title: "Stability by component",
      dots: ["red", "yellow", "green"],
    },
    {
      type: "stabilityDistribution",
      groupBy: "feature",
      title: "Stability by feature",
      dots: ["red", "yellow", "green"],
    },
    {
      type: "stabilityDistribution",
      groupBy: "epic",
      title: "Stability by epic",
      dots: ["red", "yellow", "green"],
    },
    {
      type: "stabilityDistribution",
      groupBy: "story",
      title: "Stability by story",
      dots: ["red", "yellow", "green"],
    },
    { type: "durations", groupBy: "none", title: "Durations", dots: ["blue"] },
    {
      type: "durations",
      groupBy: "layer",
      title: "Durations by layer",
      dots: ["red", "orange", "yellow", "purple", "green", "blue"],
    },
    { type: "durationDynamics", title: "Duration dynamics", dots: ["blue"] },
    { type: "statusAgePyramid", title: "Status age pyramid", dots: ["red", "yellow", "gray", "purple"] },
  ];

  function readVariant(tile, body) {
    function attr(el, name) {
      return (el && el.getAttribute && el.getAttribute(name)) || "";
    }
    return {
      groupBy: (attr(body, "data-group-by") || attr(tile, "data-group-by") || "").trim(),
      by: (attr(body, "data-by") || attr(tile, "data-by") || "").trim(),
    };
  }

  /** Match CATALOG slot for a tile (type + optional groupBy / by). */
  function catalogSlot(kind, variant) {
    var resolved = resolveKind(kind, variant);
    var key = resolved.key;
    var groupBy = (variant && variant.groupBy) || "";
    var by = (variant && variant.by) || "";
    var i;
    var slot;
    for (i = 0; i < CATALOG.length; i++) {
      slot = CATALOG[i];
      if (slot.type !== key) continue;
      if (slot.groupBy && slot.groupBy !== groupBy) continue;
      if (slot.by && slot.by !== by) continue;
      if (!slot.groupBy && groupBy && key === "durations") continue;
      return slot;
    }
    for (i = 0; i < CATALOG.length; i++) {
      if (CATALOG[i].type === key) return CATALOG[i];
    }
    return null;
  }

  /** Sync bar status-family dots from CATALOG. */
  function syncIndicators(tile, kind, variant) {
    if (!tile || !tile.querySelector) return;
    var bar = tile.querySelector(".widget-tile__bar");
    if (!bar) return;
    var slot = catalogSlot(kind, variant);
    var names = slot && Array.isArray(slot.dots) ? slot.dots : [];
    var row = bar.querySelector(":scope > .indicator-row");
    if (!row) {
      row = document.createElement("div");
      row.className = "indicator-row";
      row.setAttribute("aria-hidden", "true");
      bar.insertBefore(row, bar.firstChild);
    }
    row.innerHTML = names
      .map(function (d) {
        return '<span class="indicator indicator--status-' + d + '"></span>';
      })
      .join("");
  }

  function fill(root, opts) {
    var scope = root || document;
    var force = opts && opts.force;
    var bodies = scope.querySelectorAll
      ? scope.querySelectorAll(".widget-tile__body[data-mock], .widget-tile[data-chart] .widget-tile__body")
      : [];
    Array.prototype.forEach.call(bodies, function (body) {
      if (!force && body.getAttribute("data-mock-filled") === "1") return;
      var tile = body.closest(".widget-tile");
      var kind = (body.getAttribute("data-mock") || (tile && tile.getAttribute("data-chart")) || "").trim();
      var variant = readVariant(tile, body);
      var resolved = resolveKind(kind, variant);
      if (!resolved.render) return;
      body.innerHTML = resolved.render(body, resolved.variant);
      body.setAttribute("data-mock-filled", "1");
      syncIndicators(tile, kind, variant);
    });
  }

  global.WidgetTileMocks = {
    fill: fill,
    renderers: RENDERERS,
    catalog: CATALOG,
    resolveKind: resolveKind,
    catalogSlot: catalogSlot,
    syncIndicators: syncIndicators,
    tierForSpan: tierForSpan,
    tileVars: tileVars,
  };
})(typeof window !== "undefined" ? window : globalThis);
