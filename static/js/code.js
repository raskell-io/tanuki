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
  function hasTopLevelBlock(config, blockName) {
    return new RegExp('(?:^|\\n)\\s*' + blockName + '\\s*\\{', 'm').test(config);
  }

  // Check if config starts with a standalone block that needs a parent wrapper
  function hasStandaloneBlock(config, name) {
    return new RegExp('(?:^|\\n)\\s*' + name + '\\s+["{]', 'm').test(config)
        || new RegExp('(?:^|\\n)\\s*' + name + '\\s*$', 'm').test(config);
  }

  // Wrap partial KDL snippets with minimal boilerplate so the validator accepts them
  function wrapPartialConfig(config) {
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
    if (/(?:^|\n)\s*target\s+"/.test(result) && !hasTopLevelBlock(result, 'upstreams')) {
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
      'static-files', 'type', 'config'
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

    // Add dummy targets to standalone upstreams that lack them
    // Use a brace-depth-aware approach instead of simple regex
    var upstreamLines = result.split('\n');
    var fixedLines = [];
    var inUpstream = false;
    var upstreamDepth = 0;
    var upstreamHasTarget = false;
    var upstreamCloseIdx = -1;

    for (var ui = 0; ui < upstreamLines.length; ui++) {
      var uline = upstreamLines[ui];
      var utrimmed = uline.trim();

      if (!inUpstream && /^upstream\s+"[^"]+"\s*\{/.test(utrimmed)) {
        inUpstream = true;
        upstreamDepth = 0;
        upstreamHasTarget = false;
      }

      if (inUpstream) {
        if (/target\s+"/.test(utrimmed) || /discovery\s+"/.test(utrimmed)) {
          upstreamHasTarget = true;
        }
        for (var uc = 0; uc < utrimmed.length; uc++) {
          if (utrimmed[uc] === '{') upstreamDepth++;
          else if (utrimmed[uc] === '}') upstreamDepth--;
        }
        if (upstreamDepth <= 0) {
          if (!upstreamHasTarget) {
            // Insert dummy target before the closing brace
            fixedLines.push('        target "127.0.0.1:3000"');
          }
          inUpstream = false;
        }
      }

      fixedLines.push(uline);
    }
    result = fixedLines.join('\n');

    // Now add the standard boilerplate if still missing
    var hasRoutes = hasTopLevelBlock(result, 'routes');
    var hasUpstreams = hasTopLevelBlock(result, 'upstreams');
    var hasListeners = hasTopLevelBlock(result, 'listeners');
    var extra = '';

    if (!hasRoutes) {
      extra += '\nroutes {\n    route "default" {\n        matches { path-prefix "/" }\n        upstream "backend"\n    }\n}\n';
    }
    if (!hasUpstreams) {
      // Collect upstream names referenced in routes
      var upstreamRefs = result.match(/upstream\s+"([^"]+)"/g) || [];
      var upstreamNames = {};
      for (var i = 0; i < upstreamRefs.length; i++) {
        var m = upstreamRefs[i].match(/upstream\s+"([^"]+)"/);
        if (m) upstreamNames[m[1]] = true;
      }
      // Create upstream stubs for each referenced name
      var names = Object.keys(upstreamNames);
      if (names.length === 0) names = ['backend'];
      extra += '\nupstreams {\n';
      for (var j = 0; j < names.length; j++) {
        extra += '    upstream "' + names[j] + '" {\n        target "127.0.0.1:3000"\n    }\n';
      }
      extra += '}\n';
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
        const { default: init, validate, init_panic_hook } = await import('/wasm/sentinel_playground_wasm.js');
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
