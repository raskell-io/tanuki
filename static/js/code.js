// =============================================================================
// Code Blocks - Raskell Theme
// Copy button, language labels, and KDL playground integration
// =============================================================================

(function() {
  'use strict';

  // Lucide icons (inline SVG for performance)
  const icons = {
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    externalLink: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>',
    loading: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>'
  };

  // Language display names
  const languageNames = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',
    rb: 'Ruby',
    ruby: 'Ruby',
    rs: 'Rust',
    rust: 'Rust',
    go: 'Go',
    golang: 'Go',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    'c++': 'C++',
    cs: 'C#',
    csharp: 'C#',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    scala: 'Scala',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    toml: 'TOML',
    xml: 'XML',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Bash',
    zsh: 'Zsh',
    fish: 'Fish',
    ps: 'PowerShell',
    powershell: 'PowerShell',
    dockerfile: 'Dockerfile',
    docker: 'Docker',
    md: 'Markdown',
    markdown: 'Markdown',
    txt: 'Plain Text',
    text: 'Plain Text',
    diff: 'Diff',
    git: 'Git',
    vim: 'Vim',
    lua: 'Lua',
    perl: 'Perl',
    r: 'R',
    matlab: 'MATLAB',
    graphql: 'GraphQL',
    nginx: 'Nginx',
    apache: 'Apache',
    ini: 'INI',
    env: 'Environment',
    jsx: 'JSX',
    tsx: 'TSX',
    vue: 'Vue',
    svelte: 'Svelte',
    astro: 'Astro',
    zig: 'Zig',
    nim: 'Nim',
    elixir: 'Elixir',
    erlang: 'Erlang',
    haskell: 'Haskell',
    ocaml: 'OCaml',
    fsharp: 'F#',
    clojure: 'Clojure',
    lisp: 'Lisp',
    scheme: 'Scheme',
    asm: 'Assembly',
    wasm: 'WebAssembly',
    proto: 'Protobuf',
    terraform: 'Terraform',
    hcl: 'HCL',
    kdl: 'KDL'
  };

  // WASM module state
  let wasmModule = null;
  let wasmLoading = false;
  let wasmLoadPromise = null;

  // Playground URL
  const PLAYGROUND_URL = 'https://sentinel.raskell.io/playground/';

  function getLanguageName(lang) {
    if (!lang) return null;
    const lower = lang.toLowerCase();
    return languageNames[lower] || lang.toUpperCase();
  }

  function getCodeLang(code) {
    // Check language-* class first (standard markdown output)
    const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
    if (langClass) return langClass.replace('language-', '').toLowerCase();
    // Fall back to data-lang attribute (Zola class-based highlighting)
    const dataLang = code.getAttribute('data-lang');
    if (dataLang) return dataLang.toLowerCase();
    return null;
  }

  function isKDLBlock(pre, code) {
    return getCodeLang(code) === 'kdl';
  }

  // Detect whether a KDL block is a complete config (has required top-level sections)
  // vs a partial snippet (e.g., just a route or matches block)
  function isCompleteConfig(config) {
    return /(?:^|\n)\s*system\s*\{/m.test(config) && /(?:^|\n)\s*listeners\s*\{/m.test(config);
  }

  // Check if a config has a specific top-level block
  // True when `name` introduces a block at the snippet's outermost nesting
  // level. Indentation is not a reliable signal -- a whole snippet may be
  // indented -- so this tracks brace depth instead. Matching by indentation
  // saw the nested `listener`, `upstream` and `route` inside a namespace as
  // three standalone blocks and wrapped the snippet in all three parents.
  function appearsAtTopDepth(config, name, pattern) {
    var lines = config.split('\n');
    var depth = 0;
    var re = new RegExp('^\\s*' + name + pattern);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (depth === 0 && re.test(line)) return true;
      for (var j = 0; j < line.length; j++) {
        if (line[j] === '{') depth++;
        else if (line[j] === '}') depth--;
      }
      if (depth < 0) depth = 0;
    }
    return false;
  }

  function hasTopLevelBlock(config, blockName) {
    return appearsAtTopDepth(config, blockName, '\\s*\\{');
  }

  // Check if config starts with a standalone block that needs a parent wrapper
  function hasStandaloneBlock(config, name) {
    return appearsAtTopDepth(config, name, '\\s+["{]')
        || appearsAtTopDepth(config, name, '\\s*$');
  }

  // Collect all upstream names defined inside an upstreams { } block
  function getDefinedUpstreamNames(config) {
    var names = {};
    var m = config.match(/upstreams\s*\{([\s\S]*)/);
    if (!m) return names;
    var body = m[1];
    var depth = 1;
    var end = 0;
    for (var i = 0; i < body.length; i++) {
      if (body[i] === '{') depth++;
      else if (body[i] === '}') { depth--; if (depth <= 0) { end = i; break; } }
    }
    body = body.substring(0, end);
    var re = /upstream\s+"([^"]+)"/g;
    var match;
    while ((match = re.exec(body)) !== null) {
      names[match[1]] = true;
    }
    return names;
  }

  // Collect all upstream names referenced in route blocks (upstream "name" as child of route)
  function getReferencedUpstreamNames(config) {
    var names = {};
    // Match upstream "name" that appears inside routes (not inside upstreams block definitions)
    var routesMatch = config.match(/routes\s*\{([\s\S]*)/);
    if (!routesMatch) {
      // Also check for top-level upstream references
      var refs = config.match(/upstream\s+"([^"]+)"/g) || [];
      for (var i = 0; i < refs.length; i++) {
        var rm = refs[i].match(/upstream\s+"([^"]+)"/);
        if (rm) names[rm[1]] = true;
      }
      return names;
    }
    var body = routesMatch[1];
    var depth = 1;
    var end = 0;
    for (var i = 0; i < body.length; i++) {
      if (body[i] === '{') depth++;
      else if (body[i] === '}') { depth--; if (depth <= 0) { end = i; break; } }
    }
    body = body.substring(0, end);
    var re = /upstream\s+"([^"]+)"/g;
    var match;
    while ((match = re.exec(body)) !== null) {
      names[match[1]] = true;
    }
    return names;
  }

  // Wrap partial KDL snippets with minimal boilerplate so the validator accepts them
  function wrapPartialConfig(config) {
    // `include` is a real directive, but it resolves paths relative to the file
    // on disk and cannot be followed from a string, so the parser rejects it
    // outright. Checked before the completeness test, because a config using
    // `include` is usually complete in every other respect.
    if (/(?:^|\n)\s*include\s+"/.test(config)) {
      return null;
    }

    // Snippets that deliberately show superseded syntax, for a migration or
    // upgrade guide, are labelled as such. Validating them against the current
    // parser reports exactly what the prose is already telling the reader.
    if (/\/\/\s*(old|before|v1|deprecated|legacy)\b/i.test(config)) {
      return null;
    }

    // A structural overview -- every block present and empty -- documents the
    // shape of a configuration rather than a configuration. There is nothing in
    // it to check.
    if (/^(?:\s*[a-z-]+\s*\{\s*\}\s*)+$/.test(config)) {
      return null;
    }

    if (isCompleteConfig(config)) return config;

    var result = config;

    // Wrap standalone singular blocks in their plural parent
    // e.g., route "api" { ... } → routes { route "api" { ... } }
    var wrappers = [
      ['route', 'routes'],
      ['upstream', 'upstreams'],
      ['agent', 'agents'],
      ['filter', 'filters'],
      ['listener', 'listeners']
    ];

    for (var w = 0; w < wrappers.length; w++) {
      var singular = wrappers[w][0];
      var plural = wrappers[w][1];
      // Only wrap if we have the singular but NOT the plural
      if (hasStandaloneBlock(result, singular) && !hasTopLevelBlock(result, plural)) {
        result = plural + ' {\n' + result + '\n}\n';
      }
    }

    // Wrap standalone matches { } in a route → routes
    if (hasTopLevelBlock(result, 'matches') && !hasTopLevelBlock(result, 'routes')) {
      result = 'routes {\n    route "example" {\n' + result + '\n        upstream "backend"\n    }\n}\n';
    }

    // Wrap standalone target in an upstream → upstreams
    // Depth-aware: a `target` nested inside a namespace's own upstream is not
    // a standalone target snippet, and wrapping on it buried the whole config
    // inside an `upstreams { upstream "backend" {` that has no target of its own.
    if (appearsAtTopDepth(result, 'target', '\\s+"') && !hasTopLevelBlock(result, 'upstreams')) {
      result = 'upstreams {\n    upstream "backend" {\n' + result + '\n    }\n}\n';
    }

    // Wrap standalone tls/connection-pool blocks inside a listener
    if ((hasTopLevelBlock(result, 'tls') || hasTopLevelBlock(result, 'connection-pool'))
        && !hasTopLevelBlock(result, 'listeners')) {
      result = 'listeners {\n    listener "https" {\n        address "0.0.0.0:443"\n' + result + '\n    }\n}\n';
    }

    // Wrap standalone tracing/metrics/access-log blocks inside observability
    if ((hasTopLevelBlock(result, 'tracing') || hasTopLevelBlock(result, 'metrics') || hasTopLevelBlock(result, 'access-log'))
        && !hasTopLevelBlock(result, 'observability')) {
      result = 'observability {\n' + result + '\n}\n';
    }

    // A standalone `service` block belongs to a namespace.
    if (hasStandaloneBlock(result, 'service') && !hasTopLevelBlock(result, 'namespace')) {
      result = 'namespace "example" {\n' + result + '\n}\n';
    }

    // Wrap standalone mcp/a2a blocks inside a route -- both are route-level.
    if ((hasTopLevelBlock(result, 'mcp') || hasTopLevelBlock(result, 'a2a'))
        && !hasTopLevelBlock(result, 'routes')) {
      result = 'routes {\n    route "example" {\n        matches { path-prefix "/" }\n        upstream "backend"\n' + result + '\n    }\n}\n';
    }

    // Wrap a standalone sni block inside a listener's tls block.
    if (hasTopLevelBlock(result, 'sni') && !hasTopLevelBlock(result, 'listeners')) {
      result = 'listeners {\n    listener "https" {\n        address "0.0.0.0:443"\n        protocol "https"\n        tls {\n            cert-file "/etc/zentinel/certs/server.crt"\n            key-file "/etc/zentinel/certs/server.key"\n' + result + '\n        }\n    }\n}\n';
    }

    // Wrap standalone policies/shadow/circuit-breaker inside a route
    if ((hasTopLevelBlock(result, 'policies') || hasTopLevelBlock(result, 'shadow'))
        && !hasTopLevelBlock(result, 'routes')) {
      result = 'routes {\n    route "example" {\n        matches { path-prefix "/" }\n        upstream "backend"\n' + result + '\n    }\n}\n';
    }

    // Blocks that can't be validated — return null to signal "skip"
    var unknownBlocks = [
      'admin', 'inference', 'canary', 'security', 'stack',
      'api-schema', 'error-pages', 'rate-limit', 'budget',
      'cost-attribution', 'model-routing', 'service',
      'dns-provider', 'exports', 'reverse-listener',
      'static-files', 'type', 'config', 'namespaces',
      'retry-policy', 'health-check', 'circuit-breaker',
      'timeouts', 'http-version', 'logging', 'transport',
      'ruleset', 'prompt-injection', 'pii-detection',
      'fallback', 'fallback-upstream', 'response-headers',
      'pages', 'model', 'limits', 'request-headers',
      'geo'
    ];
    for (var u = 0; u < unknownBlocks.length; u++) {
      if (hasTopLevelBlock(result, unknownBlocks[u])) {
        return null; // Signal to skip validation
      }
    }

    // Skip validation for standalone header/attribute value snippets
    if (/^\s*"[A-Z]/.test(result.trim())) {
      return null;
    }

    // Skip snippets that are just bare KDL syntax examples (no braces at all)
    if (result.indexOf('{') === -1) {
      return null;
    }

    // Remove waf blocks entirely to avoid runtime-wiring validation error
    result = result.replace(/(?:^|\n)\s*waf\s*\{[\s\S]*?\n\}/gm, '');

    // Add dummy targets to upstreams that lack them (brace-depth-aware)
    var upstreamLines = result.split('\n');
    var fixedLines = [];
    var inUpstream = false;
    var upstreamDepth = 0;
    var upstreamHasTarget = false;

    for (var ui = 0; ui < upstreamLines.length; ui++) {
      var uline = upstreamLines[ui];
      var utrimmed = uline.trim();

      if (!inUpstream && /^upstream\s+"[^"]+"\s*\{/.test(utrimmed)) {
        inUpstream = true;
        upstreamDepth = 0;
        upstreamHasTarget = false;
      }

      if (inUpstream) {
        if (/target\s+"/.test(utrimmed)) {
          upstreamHasTarget = true;
        }
        for (var uc = 0; uc < utrimmed.length; uc++) {
          if (utrimmed[uc] === '{') upstreamDepth++;
          else if (utrimmed[uc] === '}') upstreamDepth--;
        }
        if (upstreamDepth <= 0) {
          if (!upstreamHasTarget) {
            fixedLines.push('        target "127.0.0.1:3000"');
          }
          inUpstream = false;
        }
      }

      fixedLines.push(uline);
    }
    result = fixedLines.join('\n');

    // Add dummy transport to agents that lack one (brace-depth-aware)
    var agentLines = result.split('\n');
    var agentFixed = [];
    var inAgent = false;
    var agentDepth = 0;
    var agentHasTransport = false;

    for (var ai = 0; ai < agentLines.length; ai++) {
      var aline = agentLines[ai];
      var atrimmed = aline.trim();

      if (!inAgent && /^agent\s+"[^"]+"\s/.test(atrimmed)) {
        inAgent = true;
        agentDepth = 0;
        agentHasTransport = false;
      }

      if (inAgent) {
        if (/unix-socket\s+"/.test(atrimmed) || /grpc\s+"/.test(atrimmed) || /http\s+"/.test(atrimmed) || /binary-uds\s+"/.test(atrimmed)) {
          agentHasTransport = true;
        }
        for (var ac = 0; ac < atrimmed.length; ac++) {
          if (atrimmed[ac] === '{') agentDepth++;
          else if (atrimmed[ac] === '}') agentDepth--;
        }
        if (agentDepth <= 0) {
          if (!agentHasTransport) {
            agentFixed.push('        unix-socket "/tmp/zentinel-agent.sock"');
          }
          inAgent = false;
        }
      }

      agentFixed.push(aline);
    }
    result = agentFixed.join('\n');

    // Add dummy cert-file/key-file to TLS blocks that lack them (brace-depth-aware)
    var tlsLines = result.split('\n');
    var tlsFixed = [];
    var inTls = false;
    var tlsDepth = 0;
    var tlsHasCert = false;
    var tlsHasAcme = false;

    for (var ti = 0; ti < tlsLines.length; ti++) {
      var tline = tlsLines[ti];
      var ttrimmed = tline.trim();

      if (!inTls && /^tls\s*\{/.test(ttrimmed)) {
        inTls = true;
        tlsDepth = 0;
        tlsHasCert = false;
        tlsHasAcme = false;
      }

      if (inTls) {
        if (/cert-file\s+"/.test(ttrimmed)) tlsHasCert = true;
        if (/acme\s*\{/.test(ttrimmed)) tlsHasAcme = true;
        for (var tc = 0; tc < ttrimmed.length; tc++) {
          if (ttrimmed[tc] === '{') tlsDepth++;
          else if (ttrimmed[tc] === '}') tlsDepth--;
        }
        if (tlsDepth <= 0) {
          if (!tlsHasCert && !tlsHasAcme) {
            tlsFixed.push('            cert-file "/etc/zentinel/tls/cert.pem"');
            tlsFixed.push('            key-file "/etc/zentinel/tls/key.pem"');
          }
          inTls = false;
        }
      }

      tlsFixed.push(tline);
    }
    result = tlsFixed.join('\n');

    // Add backend stub to tracing blocks that lack one (brace-depth-aware)
    var tracingLines = result.split('\n');
    var tracingFixed = [];
    var inTracing = false;
    var tracingDepth = 0;
    var tracingHasBackend = false;

    for (var tri = 0; tri < tracingLines.length; tri++) {
      var trline = tracingLines[tri];
      var trtrimmed = trline.trim();

      if (!inTracing && /^tracing\s*\{/.test(trtrimmed)) {
        inTracing = true;
        tracingDepth = 0;
        tracingHasBackend = false;
      }

      if (inTracing) {
        if (/backend\s*\{/.test(trtrimmed)) tracingHasBackend = true;
        for (var trc = 0; trc < trtrimmed.length; trc++) {
          if (trtrimmed[trc] === '{') tracingDepth++;
          else if (trtrimmed[trc] === '}') tracingDepth--;
        }
        if (tracingDepth <= 0) {
          if (!tracingHasBackend) {
            tracingFixed.push('        backend "otlp" { endpoint "http://localhost:4318" }');
          }
          inTracing = false;
        }
      }

      tracingFixed.push(trline);
    }
    result = tracingFixed.join('\n');

    // Ensure routes have recognized match conditions (path-prefix, path, or host)
    // The parser ignores method, header, query-param, path-regex so they don't count
    // If matches block exists but only has unrecognized conditions, inject path-prefix into it
    var routeLines = result.split('\n');
    var routeFixed = [];
    var inRoute = false;
    var routeDepth = 0;
    var routeHasValidMatch = false;
    var routeHasMatchesBlock = false;
    var routeMatchesLine = -1;
    var routeHasUpstream = false;
    var routeHasPriority = false;

    for (var ri = 0; ri < routeLines.length; ri++) {
      var rline = routeLines[ri];
      var rtrimmed = rline.trim();

      if (!inRoute && /^route\s+"[^"]+"\s/.test(rtrimmed)) {
        inRoute = true;
        routeDepth = 0;
        routeHasValidMatch = false;
        routeHasMatchesBlock = false;
        routeMatchesLine = -1;
        routeHasUpstream = false;
        routeHasPriority = false;
      }

      if (inRoute) {
        if (/path-prefix\s+"/.test(rtrimmed) || /(?:^|\s)path\s+"/.test(rtrimmed) || /host\s+"/.test(rtrimmed)) {
          routeHasValidMatch = true;
        }
        if (/matches\s*\{/.test(rtrimmed) && routeMatchesLine === -1) {
          routeHasMatchesBlock = true;
          routeMatchesLine = routeFixed.length; // Will be inserted after this line
        }
        if (/upstream\s+"/.test(rtrimmed)) routeHasUpstream = true;
        if (/priority\s+"?low"?/.test(rtrimmed)) routeHasPriority = true;
        for (var rc = 0; rc < rtrimmed.length; rc++) {
          if (rtrimmed[rc] === '{') routeDepth++;
          else if (rtrimmed[rc] === '}') routeDepth--;
        }
        if (routeDepth <= 0) {
          if (!routeHasValidMatch && !routeHasPriority) {
            if (routeHasMatchesBlock && routeMatchesLine >= 0) {
              // Inject path-prefix into the existing matches block (after the opening line)
              routeFixed.splice(routeMatchesLine + 1, 0, '            path-prefix "/"');
            } else {
              // No matches block at all — add one
              routeFixed.push('        matches { path-prefix "/" }');
            }
          }
          if (!routeHasUpstream) {
            routeFixed.push('        upstream "backend"');
          }
          inRoute = false;
        }
      }

      routeFixed.push(rline);
    }
    result = routeFixed.join('\n');

    // Ensure listeners have an address field
    var listenerLines = result.split('\n');
    var listenerFixed = [];
    var inListener = false;
    var listenerDepth = 0;
    var listenerHasAddress = false;

    for (var li = 0; li < listenerLines.length; li++) {
      var lline = listenerLines[li];
      var ltrimmed = lline.trim();

      if (!inListener && /^listener\s+"[^"]+"\s*\{/.test(ltrimmed)) {
        inListener = true;
        listenerDepth = 0;
        listenerHasAddress = false;
      }

      if (inListener) {
        if (/address\s+"/.test(ltrimmed)) listenerHasAddress = true;
        for (var lc = 0; lc < ltrimmed.length; lc++) {
          if (ltrimmed[lc] === '{') listenerDepth++;
          else if (ltrimmed[lc] === '}') listenerDepth--;
        }
        if (listenerDepth <= 0) {
          if (!listenerHasAddress) {
            listenerFixed.push('        address "0.0.0.0:8080"');
          }
          inListener = false;
        }
      }

      listenerFixed.push(lline);
    }
    result = listenerFixed.join('\n');

    // Now add the standard boilerplate if still missing
    var hasRoutes = hasTopLevelBlock(result, 'routes');
    var hasUpstreams = hasTopLevelBlock(result, 'upstreams');
    var hasListeners = hasTopLevelBlock(result, 'listeners');
    var extra = '';

    // Collect referenced upstream names and defined upstream names
    var referencedUpstreams = getReferencedUpstreamNames(result);
    var definedUpstreams = getDefinedUpstreamNames(result);

    // Determine the default upstream name for the boilerplate route
    var defaultUpstream = 'backend';
    var defKeys = Object.keys(definedUpstreams);
    if (defKeys.length > 0) {
      defaultUpstream = defKeys[0];
    }

    if (!hasRoutes) {
      extra += '\nroutes {\n    route "default" {\n        matches { path-prefix "/" }\n        upstream "' + defaultUpstream + '"\n    }\n}\n';
    }

    if (!hasUpstreams) {
      // No upstreams block at all — create one with all referenced upstreams
      var allRefs = Object.keys(referencedUpstreams);
      if (allRefs.length === 0) allRefs = ['backend'];
      extra += '\nupstreams {\n';
      for (var j = 0; j < allRefs.length; j++) {
        extra += '    upstream "' + allRefs[j] + '" {\n        target "127.0.0.1:3000"\n    }\n';
      }
      extra += '}\n';
    } else {
      // Upstreams block exists — add missing referenced upstreams
      var missingUpstreams = [];
      for (var refName in referencedUpstreams) {
        if (!definedUpstreams[refName]) {
          missingUpstreams.push(refName);
        }
      }
      if (missingUpstreams.length > 0) {
        // Insert missing upstreams into the existing upstreams block
        var insertStubs = '';
        for (var mi = 0; mi < missingUpstreams.length; mi++) {
          insertStubs += '\n    upstream "' + missingUpstreams[mi] + '" {\n        target "127.0.0.1:3000"\n    }';
        }
        // Find the last closing brace of the upstreams block and insert before it
        var upstreamsEnd = result.lastIndexOf('}');
        // More precise: find the upstreams block and insert before its closing brace
        var upIdx = result.search(/upstreams\s*\{/);
        if (upIdx !== -1) {
          var upBody = result.substring(upIdx);
          var upDepth2 = 0;
          var upEndIdx = 0;
          for (var k = 0; k < upBody.length; k++) {
            if (upBody[k] === '{') upDepth2++;
            else if (upBody[k] === '}') {
              upDepth2--;
              if (upDepth2 <= 0) { upEndIdx = upIdx + k; break; }
            }
          }
          result = result.substring(0, upEndIdx) + insertStubs + '\n' + result.substring(upEndIdx);
        }
      }
    }

    var prefix = '';
    if (!hasTopLevelBlock(result, 'system')) {
      prefix += 'system {\n    worker-threads 0\n}\n\n';
    }
    if (!hasListeners) {
      prefix += 'listeners {\n    listener "http" {\n        address "0.0.0.0:8080"\n        protocol "http"\n    }\n}\n\n';
    }

    return prefix + result + '\n' + extra;
  }

  // Normalize current config syntax to match the WASM validator (v0.2.4)
  function preprocessConfig(config) {
    let result = config;

    // Rename cert-path → cert-file, key-path → key-file
    result = result.replace(/\bcert-path\b/g, 'cert-file');
    result = result.replace(/\bkey-path\b/g, 'key-file');

    // Rename socket "/path" → unix-socket "/path" (agent transport shorthand)
    // Use negative lookbehind to avoid matching "unix-socket" → "unix-unix-socket"
    result = result.replace(/(?<![-\w])socket\s+"(\/[^"]*)"/g, 'unix-socket "$1"');

    // Fix bare booleans: true → #true, false → #false (KDL requires # prefix)
    // Only replace bare true/false that are KDL values (after a key name),
    // not ones inside strings or comments
    var boolLines = result.split('\n');
    for (var bi = 0; bi < boolLines.length; bi++) {
      var bline = boolLines[bi];
      // Skip comment lines
      var commentIdx = bline.indexOf('//');
      var codePart = commentIdx >= 0 ? bline.substring(0, commentIdx) : bline;
      var commentPart = commentIdx >= 0 ? bline.substring(commentIdx) : '';
      // Replace bare true/false not preceded by # and not inside strings
      // Simple heuristic: replace word-boundary true/false not after #
      codePart = codePart.replace(/(?<!#)\b(true|false)\b/g, '#$1');
      boolLines[bi] = codePart + commentPart;
    }
    result = boolLines.join('\n');

    // Fix # comments → // comments (# is not a valid KDL comment marker)
    result = result.replace(/^(\s*)#\s+/gm, '$1// ');

    // Rename workers → worker-threads (old config name)
    result = result.replace(/\bworkers\s+(\d+)/g, 'worker-threads $1');

    // Flatten target { address "addr" [weight N] } → target "addr" [weight=N]
    result = result.replace(
      /target\s*\{[^}]*?address\s+"([^"]+)"([^}]*)\}/g,
      function(match, addr, rest) {
        var w = rest.match(/weight\s+(\d+)/);
        return w ? 'target "' + addr + '" weight=' + w[1] : 'target "' + addr + '"';
      }
    );

    // Remove targets { } wrapper (preserve child lines)
    var lines = result.split('\n');
    var output = [];
    var inWrapper = false;
    var depth = 0;

    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();

      if (!inWrapper && /^targets\s*\{$/.test(t)) {
        inWrapper = true;
        depth = 1;
        continue;
      }

      if (inWrapper) {
        for (var j = 0; j < t.length; j++) {
          if (t[j] === '{') depth++;
          else if (t[j] === '}') depth--;
        }
        if (depth <= 0) {
          inWrapper = false;
          if (t === '}') continue;
        }
        output.push(lines[i]);
      } else {
        output.push(lines[i]);
      }
    }

    result = output.join('\n');

    // Wrap partial snippets with minimal boilerplate
    // Returns null if the snippet can't be validated
    result = wrapPartialConfig(result);

    // wrapPartialConfig returns null to mean "skip"; do not resurrect it.
    if (result === null) return null;

    // Give a fragment the minimal top-level blocks it is missing. A snippet
    // showing `routes { }` alone is correct documentation; it just is not a
    // whole configuration, and rejecting it says nothing useful about the
    // settings it demonstrates.
    if (!appearsAtTopDepth(result, 'system', '\\s*\\{')) {
      result = 'system {\n    worker-threads 2\n}\n\n' + result;
    }
    if (!appearsAtTopDepth(result, 'listeners', '\\s*\\{')) {
      result = result + '\nlisteners {\n    listener "http" {\n        address "0.0.0.0:8080"\n    }\n}\n';
    }

    return result;
  }

  // Pages where KDL validation should be skipped (partial snippets only)
  function shouldSkipValidation() {
    const path = window.location.pathname;
    // Only skip validation on directive reference pages (partial snippets)
    // Examples and getting-started pages now have complete, valid configs
    return path.includes('/reference/directives');
  }

  async function loadWASM() {
    if (wasmModule) return wasmModule;
    if (wasmLoadPromise) return wasmLoadPromise;

    wasmLoading = true;
    wasmLoadPromise = (async () => {
      try {
        const { default: init, validate, init_panic_hook } = await import('/wasm/zentinel_playground_wasm.js');
        await init();
        init_panic_hook();
        wasmModule = { validate };
        wasmLoading = false;
        return wasmModule;
      } catch (e) {
        console.error('Failed to load WASM:', e);
        wasmLoading = false;
        wasmLoadPromise = null;
        throw e;
      }
    })();

    return wasmLoadPromise;
  }

  async function validateKDL(config) {
    const processed = preprocessConfig(config);
    if (processed === null) {
      // Snippet can't be wrapped into a valid config — treat as valid (skip)
      return { valid: true, skipped: true };
    }
    const wasm = await loadWASM();
    return wasm.validate(processed);
  }

  function encodeConfigForURL(config) {
    return encodeURIComponent(btoa(config));
  }

  function getPlaygroundURL(config) {
    return `${PLAYGROUND_URL}#config=${encodeConfigForURL(config)}`;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  function createCopyButton() {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.setAttribute('aria-label', 'Copy code');
    button.innerHTML = `${icons.copy}<span>Copy</span>`;
    return button;
  }

  function createValidateButton() {
    const button = document.createElement('button');
    button.className = 'validate-button';
    button.setAttribute('aria-label', 'Validate config');
    button.innerHTML = `${icons.play}<span>Validate</span>`;
    return button;
  }

  function createEditButton() {
    const button = document.createElement('button');
    button.className = 'edit-button';
    button.setAttribute('aria-label', 'Edit config');
    button.innerHTML = `${icons.edit}<span>Edit</span>`;
    return button;
  }

  function createPlaygroundLink() {
    const link = document.createElement('a');
    link.className = 'playground-link';
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.innerHTML = `${icons.externalLink}<span>Open in Playground</span>`;
    return link;
  }

  function setValidationState(button, state, message) {
    button.classList.remove('valid', 'invalid', 'loading', 'warning');

    switch (state) {
      case 'loading':
        button.classList.add('loading');
        button.innerHTML = `${icons.loading}<span>Checking...</span>`;
        break;
      case 'valid':
        button.classList.add('valid');
        button.innerHTML = `${icons.check}<span>Valid</span>`;
        break;
      case 'invalid':
        button.classList.add('invalid');
        button.innerHTML = `${icons.play}<span>${message || 'Invalid'}</span>`;
        break;
      case 'warning':
        button.classList.add('warning');
        button.innerHTML = `${icons.check}<span>Valid (warnings)</span>`;
        break;
      default:
        button.innerHTML = `${icons.play}<span>Validate</span>`;
    }
  }

  async function handleValidation(pre, code, validateBtn, playgroundLink, autoTriggered) {
    const config = code.textContent;

    // Skip auto-validation on directive reference pages (intentionally partial)
    if (autoTriggered && shouldSkipValidation()) {
      return;
    }

    setValidationState(validateBtn, 'loading');

    try {
      const result = await validateKDL(config);

      if (result.valid) {
        if (result.warnings && result.warnings.length > 0) {
          setValidationState(validateBtn, 'warning');
        } else {
          setValidationState(validateBtn, 'valid');
        }
        playgroundLink.href = getPlaygroundURL(config);
        playgroundLink.style.display = 'flex';
      } else {
        const errorMsg = result.errors && result.errors[0]
          ? result.errors[0].message.split('\n')[0].substring(0, 30)
          : 'Invalid';
        setValidationState(validateBtn, 'invalid', errorMsg);
        playgroundLink.style.display = 'none';
      }
    } catch (e) {
      setValidationState(validateBtn, 'invalid', 'Load failed');
      console.error('Validation error:', e);
    }
  }

  function initCodeBlocks() {
    document.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code');
      if (!code) return;

      // Skip if already initialized
      if (pre.querySelector('.copy-button')) return;

      // Make pre relative for absolute positioning
      pre.style.position = 'relative';

      // Get language from class or data-lang attribute
      const lang = getCodeLang(code);
      if (lang && !pre.hasAttribute('data-lang')) {
        pre.setAttribute('data-lang', getLanguageName(lang) || lang);
      }

      // Create button container for right side
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-buttons';

      // Create copy button (always present, hover-only visibility handled by CSS)
      const copyBtn = createCopyButton();
      buttonContainer.appendChild(copyBtn);

      // Check if this is a KDL block that should be validated
      const isKDL = isKDLBlock(pre, code);
      const skipValidation = shouldSkipValidation();

      if (isKDL && !skipValidation) {
        // Create edit button (hover-only, before validate)
        const editBtn = createEditButton();
        buttonContainer.appendChild(editBtn);

        // Create validate button (always visible for KDL)
        const validateBtn = createValidateButton();
        buttonContainer.appendChild(validateBtn);

        // Create playground link (hidden initially, appears after validation)
        const playgroundLink = createPlaygroundLink();
        playgroundLink.style.display = 'none';
        buttonContainer.appendChild(playgroundLink);

        // Handle validate button click (manual = always validate)
        validateBtn.addEventListener('click', async () => {
          await handleValidation(pre, code, validateBtn, playgroundLink, false);
        });

        // Handle edit button click
        editBtn.addEventListener('click', () => {
          const isEditing = code.contentEditable === 'true';

          if (isEditing) {
            // Exit edit mode
            code.contentEditable = 'false';
            editBtn.classList.remove('editing');
            editBtn.innerHTML = `${icons.edit}<span>Edit</span>`;
            pre.classList.remove('editing');

            // Re-validate after editing (manual action)
            handleValidation(pre, code, validateBtn, playgroundLink, false);
          } else {
            // Enter edit mode
            code.contentEditable = 'true';
            code.focus();
            editBtn.classList.add('editing');
            editBtn.innerHTML = `${icons.check}<span>Done</span>`;
            pre.classList.add('editing');

            // Reset validation state
            setValidationState(validateBtn, 'default');
            playgroundLink.style.display = 'none';
          }
        });

        // Auto-validate on first view (lazy load, complete configs only)
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              handleValidation(pre, code, validateBtn, playgroundLink, true);
              observer.disconnect();
            }
          });
        }, { threshold: 0.1 });

        observer.observe(pre);
      }

      pre.appendChild(buttonContainer);

      copyBtn.addEventListener('click', async () => {
        const text = code.textContent;
        const success = await copyToClipboard(text);

        if (success) {
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = `${icons.check}<span>Copied!</span>`;

          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `${icons.copy}<span>Copy</span>`;
          }, 2000);
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }

  // Re-init after Turbo/SPA navigation
  document.addEventListener('turbo:load', initCodeBlocks);
  document.addEventListener('astro:page-load', initCodeBlocks);
})();
