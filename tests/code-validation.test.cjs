// Behavioural tests for the opt-in code-block validation in static/js/code.js.
//
// Run with:  node tests/code-validation.test.cjs static/js/code.js
//
// No dependencies: code.js is executed in a `vm` context with a stub DOM, and
// its internals are exported by appending to the IIFE before evaluation.
const fs = require('fs'), vm = require('vm');
const SRC = fs.readFileSync(process.argv[2], 'utf8');

function run(validationConfig) {
  let src = SRC;
  const close = src.lastIndexOf('})();');
  if (close < 0) throw new Error('IIFE close not found');
  src = src.slice(0, close)
      + '\n  globalThis.__t = { isValidatableBlock, shouldSkipValidation, loadWASM, WASM_MODULE, VALIDATION_LANGUAGE, PLAYGROUND_URL, SKIP_PATHS };\n'
      + src.slice(close);

  const stub = () => {};
  const el = () => ({ addEventListener: stub, classList: { add: stub, remove: stub, contains: () => false },
    appendChild: stub, setAttribute: stub, style: {}, dataset: {}, textContent: '', innerHTML: '' });
  let imported = null;
  const sandbox = {
    window: { location: { pathname: '/guide/' }, addEventListener: stub,
              matchMedia: () => ({ matches: false, addEventListener: stub }),
              tanukiCodeValidation: validationConfig },
    document: { addEventListener: stub, querySelectorAll: () => [], querySelector: () => null,
                createElement: el, body: el(), documentElement: el(), readyState: 'complete' },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    console: { log: stub, warn: stub, error: stub },
    setTimeout, clearTimeout, globalThis: null,
    __recordImport: (m) => { imported = m; },
  };
  const ctx = vm.createContext(sandbox);
  sandbox.globalThis = ctx;
  vm.runInContext(src, ctx, { filename: 'code.js' });
  return { t: ctx.__t, importedRef: () => imported };
}

// Fake a code element in the given language
const codeEl = (lang) => ({ classList: ['language-' + lang] });

let failures = 0;
const pending = [];
function check(name, cond) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name);
  if (!cond) failures++;
}

// --- unconfigured ---
{
  const { t } = run(undefined);
  check('unconfigured: WASM_MODULE is null', t.WASM_MODULE === null);
  check('unconfigured: kdl block is NOT validatable', t.isValidatableBlock(null, codeEl('kdl')) === false);
  check('unconfigured: no skip paths', t.SKIP_PATHS.length === 0);
  pending.push(
    t.loadWASM().then(
      () => check('unconfigured: loadWASM rejects rather than importing', false),
      (e) => check('unconfigured: loadWASM rejects rather than importing',
                   /No validator configured/.test(String(e && e.message)))
    )
  );
}

// --- configured ---
{
  const cfg = { wasm_module: '/wasm/v.js', language: 'kdl',
                playground_url: 'https://p/', skip_paths: ['/reference/directives'] };
  const { t } = run(cfg);
  check('configured: WASM_MODULE read', t.WASM_MODULE === '/wasm/v.js');
  check('configured: kdl block IS validatable', t.isValidatableBlock(null, codeEl('kdl')) === true);
  check('configured: other language is not', t.isValidatableBlock(null, codeEl('toml')) === false);
  check('configured: playground url read', t.PLAYGROUND_URL === 'https://p/');
}

// --- configured for a different language ---
{
  const { t } = run({ wasm_module: '/wasm/v.js', language: 'TOML' });
  check('language is case-insensitive and honoured', t.isValidatableBlock(null, codeEl('toml')) === true);
  check('kdl not validated when language is toml', t.isValidatableBlock(null, codeEl('kdl')) === false);
  check('playground url absent -> null', t.PLAYGROUND_URL === null);
}

Promise.all(pending).then(() => {
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`);
  process.exit(failures ? 1 : 0);
});
