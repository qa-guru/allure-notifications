import { escapeHtml } from './dom-utils.js';

const JSON_TOKEN =
  /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

/* JSON_TOKEN matches literal quotes, so `"` must survive escaping (dom-utils escapeHtml turns it into &quot;). */
function escapeHtmlKeepQuotes(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * @param {string} json
 * @param {{ prefix?: string }} [options]
 * @returns {string}
 */
export function highlightJson(json, options) {
  const opts = options || {};
  const prefix = opts.prefix || 'ch-tok';
  let html = escapeHtmlKeepQuotes(json);

  html = html.replace(JSON_TOKEN, function (match) {
    let cls = prefix + '-str';
    if (/^"/.test(match)) {
      if (/:\s*$/.test(match)) {
        const key = match.replace(/:\s*$/, '');
        return (
          '<span class="' + prefix + '-key">' + key + '</span>' +
          '<span class="' + prefix + '-punct">:</span>'
        );
      }
      cls = prefix + '-str';
    } else if (match === 'true' || match === 'false') {
      cls = prefix + '-bool';
    } else if (match === 'null') {
      cls = prefix + '-null';
    } else {
      cls = prefix + '-num';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });

  html = html.replace(/([{}\[\],])/g, function (ch) {
    return '<span class="' + prefix + '-punct">' + ch + '</span>';
  });

  return html;
}

function wrapToken(prefix, cls, text) {
  return '<span class="' + prefix + '-' + cls + '">' + escapeHtml(text) + '</span>';
}

function highlightShellValue(value, prefix) {
  if (value === 'true' || value === 'false') {
    return wrapToken(prefix, 'bool', value);
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return wrapToken(prefix, 'num', value);
  }
  return wrapToken(prefix, 'str', value);
}

function highlightShellToken(token, prefix) {
  if (/^\s*#/.test(token)) {
    return wrapToken(prefix, 'comment', token);
  }
  if (/^'/.test(token)) {
    return wrapToken(prefix, 'str', token);
  }
  if (/^\\/.test(token)) {
    return wrapToken(prefix, 'punct', token);
  }
  if (/^-D/.test(token)) {
    const eq = token.indexOf('=');
    if (eq < 0) {
      return wrapToken(prefix, 'key', token);
    }
    return (
      wrapToken(prefix, 'key', token.slice(0, eq)) +
      wrapToken(prefix, 'punct', '=') +
      highlightShellValue(token.slice(eq + 1), prefix)
    );
  }
  if (token === 'curl') {
    return wrapToken(prefix, 'cmd', token);
  }
  if (
    /^--/.test(token) ||
    /^-[a-zA-Z]+$/.test(token) ||
    /^(POST|GET|PUT|DELETE|PATCH|HEAD)$/.test(token) ||
    token === 'export' ||
    token === 'test' ||
    token === './gradlew' ||
    token === 'gradle' ||
    token === 'allurectl' ||
    /^ALLURE_/.test(token) ||
    token === 'TEST_CASE_ID'
  ) {
    return wrapToken(prefix, 'key', token);
  }
  return escapeHtml(token);
}

const SHELL_TOKEN =
  /'[^']*'|-D[\w.]+(?:=[^\s\\']*)?|--[\w-]+|\bcurl\b|\.\/gradlew|allurectl|\bgradle\b|\bexport\b|\btest\b|\b(?:POST|GET|PUT|DELETE|PATCH|HEAD)\b|\b(?:ALLURE_[A-Z_]+|TEST_CASE_ID)\b|-[a-zA-Z]+\b|\\\s*$|\s+#.*$/g;

/**
 * @param {string} line
 * @param {string} prefix
 * @returns {string}
 */
function highlightShellLine(line, prefix) {
  if (/^\s*#/.test(line)) {
    return wrapToken(prefix, 'comment', line);
  }

  let html = '';
  let last = 0;
  let match;

  SHELL_TOKEN.lastIndex = 0;
  while ((match = SHELL_TOKEN.exec(line)) !== null) {
    html += escapeHtml(line.slice(last, match.index));
    html += highlightShellToken(match[0], prefix);
    last = match.index + match[0].length;
  }
  html += escapeHtml(line.slice(last));
  return html;
}

/**
 * @param {string} text
 * @param {{ prefix?: string }} [options]
 * @returns {string}
 */
export function highlightShell(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || 'ch-tok';
  return String(text).split('\n').map(function (line) {
    return highlightShellLine(line, prefix);
  }).join('\n');
}

/**
 * @param {string} text
 * @param {{ prefix?: string }} [options]
 * @returns {string|null}
 */
function tryHighlightCurlQuotedData(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || 'ch-tok';
  const lines = String(text).split('\n');
  const openIdx = lines.findIndex(function (line) {
    return /(?:^|\s)-d\s+'/.test(line);
  });
  if (openIdx < 0) return null;

  const openLine = lines[openIdx];
  const m = openLine.match(/^(.*-d\s+')(.*)$/);
  if (!m) return null;

  const openWithoutQuote = m[1].slice(0, -1);
  const afterOpen = m[2];

  let jsonText;
  let closeIdx;

  const sameLineClose = afterOpen.indexOf("'");
  if (sameLineClose >= 0) {
    jsonText = afterOpen.slice(0, sameLineClose);
    closeIdx = openIdx;
  } else {
    const parts = [afterOpen];
    closeIdx = -1;
    for (let i = openIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.endsWith("'")) {
        parts.push(line.slice(0, -1));
        closeIdx = i;
        break;
      }
      parts.push(line);
    }
    if (closeIdx < 0) return null;
    jsonText = parts.join('\n');
  }

  const openHl =
    highlightShellLine(openWithoutQuote, prefix) + wrapToken(prefix, 'punct', "'");
  const body = highlightJson(jsonText, options);
  const closeQuote = wrapToken(prefix, 'punct', "'");
  const head = lines.slice(0, openIdx).map(function (line) {
    return highlightShellLine(line, prefix);
  });
  const bodyLines = body.split('\n');

  if (closeIdx === openIdx || bodyLines.length === 1) {
    return head.concat([openHl + body + closeQuote]).join('\n');
  }

  const first = openHl + bodyLines[0];
  const mid = bodyLines.slice(1, -1);
  const last = bodyLines[bodyLines.length - 1] + closeQuote;
  return head.concat([first], mid, [last]).join('\n');
}

/**
 * Shell + JSON for curl via `-d '{…}'`. Falls back to plain shell.
 * @param {string} text
 * @param {{ prefix?: string }} [options]
 * @returns {string}
 */
export function highlightCurlHeredoc(text, options) {
  return tryHighlightCurlQuotedData(text, options) || highlightShell(text, options);
}

function highlightMarkdownInline(text, prefix) {
  let html = '';
  let last = 0;
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    html += escapeHtml(text.slice(last, match.index));
    if (match[1] != null) {
      html += wrapToken(prefix, 'punct', '`');
      html += wrapToken(prefix, 'str', match[1]);
      html += wrapToken(prefix, 'punct', '`');
    } else {
      html += wrapToken(prefix, 'punct', '**');
      html += wrapToken(prefix, 'key', match[2]);
      html += wrapToken(prefix, 'punct', '**');
    }
    last = match.index + match[0].length;
  }
  html += escapeHtml(text.slice(last));
  return html;
}

function highlightMarkdownLine(line, prefix) {
  if (/^#{1,6}\s/.test(line)) {
    const m = line.match(/^(#{1,6})(\s+)(.*)$/);
    if (!m) return escapeHtml(line);
    return (
      wrapToken(prefix, 'cmd', m[1]) +
      escapeHtml(m[2]) +
      highlightMarkdownInline(m[3], prefix)
    );
  }
  if (/^-\s/.test(line)) {
    return wrapToken(prefix, 'punct', '-') + highlightMarkdownInline(line.slice(1), prefix);
  }
  return highlightMarkdownInline(line, prefix);
}

/**
 * @param {string} text
 * @param {{ prefix?: string }} [options]
 * @returns {string}
 */
export function highlightMarkdown(text, options) {
  const opts = options || {};
  const prefix = opts.prefix || 'ch-tok';
  const lines = String(text).split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fenceOpen = line.match(/^```(\w*)\s*$/);
    if (fenceOpen) {
      out.push(wrapToken(prefix, 'punct', line));
      i += 1;
      const body = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      const lang = fenceOpen[1] || '';
      if (lang === 'json' || (body.length > 0 && /^\s*[{[]/.test(body[0]))) {
        out.push(highlightJson(body.join('\n'), options));
      } else {
        for (let b = 0; b < body.length; b++) {
          out.push(escapeHtml(body[b]));
        }
      }
      if (i < lines.length && /^```\s*$/.test(lines[i])) {
        out.push(wrapToken(prefix, 'punct', lines[i]));
        i += 1;
      }
      continue;
    }

    out.push(highlightMarkdownLine(line, prefix));
    i += 1;
  }

  return out.join('\n');
}

/**
 * Strip leading/trailing blank lines — terminal canon: first glyph is `{` / `$`,
 * last is `}` / last code line (no empty pad rows).
 * @param {string} text
 * @returns {string}
 */
export function trimOutputBlankLines(text) {
  return String(text).replace(/^\n+/, '').replace(/\n+$/, '');
}

/**
 * @param {string} text
 * @param {'shell'|'json'|'plain'|'curl'|'markdown'} kind
 * @returns {string}
 */
export function highlightOutput(text, kind) {
  const trimmed = trimOutputBlankLines(text);
  switch (kind) {
    case 'json':
      return highlightJson(trimmed);
    case 'shell':
      return highlightShell(trimmed);
    case 'curl':
      return highlightCurlHeredoc(trimmed);
    case 'markdown':
      return highlightMarkdown(trimmed);
    case 'plain':
    default:
      return escapeHtml(trimmed);
  }
}

/**
 * Mount highlighted terminal output — always colored (`.ch-code` + tokens).
 * @param {Element|null|undefined} el
 * @param {string} text
 * @param {'shell'|'json'|'plain'|'curl'|'markdown'} [kind='json']
 */
export function mountHighlightedOutput(el, text, kind) {
  if (!el) return;
  el.classList.add('ch-code');
  el.innerHTML = highlightOutput(text, kind || 'json');
}

export { escapeHtml };

if (typeof globalThis !== 'undefined') {
  globalThis.CodeHighlight = {
    escapeHtml: escapeHtml,
    highlightJson: highlightJson,
    highlightShell: highlightShell,
    highlightCurlHeredoc: highlightCurlHeredoc,
    highlightMarkdown: highlightMarkdown,
    trimOutputBlankLines: trimOutputBlankLines,
    highlightOutput: highlightOutput,
    mountHighlightedOutput: mountHighlightedOutput,
  };
}
