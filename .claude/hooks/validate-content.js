// PostToolUse hook: guard content + translation integrity the instant a file
// is written/edited.
//   • content/**/*.json → run the project's Zod content validation (the same
//     check CI + `next build` run). On failure, surface the error to Claude via
//     exit 2 so it fixes the schema violation immediately.
//   • messages/*.json    → translation KEY-PARITY check: every locale must carry
//     the same key set as messages/en.json. On drift, report and exit 2.
//   • anything else       → exit 0 immediately.
//
// Fails OPEN: a JSON parse error, missing input, or any unexpected error → exit
// 0, so this hook can never block unrelated work. CommonJS on purpose — the repo
// root package.json has no "type":"module", so a .js file here is CommonJS.

const fs = require('node:fs');
const path = require('node:path');
const { execSync, execFileSync } = require('node:child_process');

const REFERENCE_LOCALE = 'en';
const MAX_KEYS_SHOWN = 30;

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// Flatten a nested translation object into a set of dot-path leaf keys.
function flattenKeys(obj, prefix, out) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    if (prefix) out.add(prefix);
    return out;
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    if (prefix) out.add(prefix);
    return out;
  }
  for (const k of keys) {
    flattenKeys(obj[k], prefix ? `${prefix}.${k}` : k, out);
  }
  return out;
}

function formatKeyList(label, keys, sign) {
  const shown = keys
    .slice(0, MAX_KEYS_SHOWN)
    .map((k) => `      ${sign} ${k}`)
    .join('\n');
  const more =
    keys.length > MAX_KEYS_SHOWN ? `\n      … +${keys.length - MAX_KEYS_SHOWN} more` : '';
  return `${label}\n${shown}${more}`;
}

// Compare every messages/*.json against messages/en.json.
function checkMessageParity(projectRoot) {
  const messagesDir = path.join(projectRoot, 'messages');
  let files;
  try {
    files = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));
  } catch {
    return { ok: true };
  }
  const refFile = `${REFERENCE_LOCALE}.json`;
  if (!files.includes(refFile)) return { ok: true }; // no reference to compare against
  let refKeys;
  try {
    const raw = fs.readFileSync(path.join(messagesDir, refFile), 'utf8');
    refKeys = flattenKeys(JSON.parse(raw), '', new Set());
  } catch (e) {
    return { ok: false, report: `  Could not parse reference messages/${refFile}: ${e.message}` };
  }

  const problems = [];
  for (const file of files) {
    if (file === refFile) continue;
    const locale = file.replace(/\.json$/, '');
    let keys;
    try {
      keys = flattenKeys(
        JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8')),
        '',
        new Set(),
      );
    } catch (e) {
      problems.push(`  messages/${file}: invalid JSON — ${e.message}`);
      continue;
    }
    const missing = [...refKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !refKeys.has(k));
    if (missing.length) {
      problems.push(
        formatKeyList(
          `  messages/${file}: ${missing.length} key(s) MISSING vs ${REFERENCE_LOCALE}:`,
          missing,
          '−',
        ),
      );
    }
    if (extra.length) {
      problems.push(
        formatKeyList(
          `  messages/${file}: ${extra.length} key(s) NOT in ${REFERENCE_LOCALE} (orphaned):`,
          extra,
          '+',
        ),
      );
    }
    void locale;
  }

  if (problems.length) {
    return {
      ok: false,
      report: `Translation key-parity drift (reference: messages/${refFile}):\n${problems.join('\n')}`,
    };
  }
  return { ok: true };
}

// Run the repo's content validator, preferring the local tsx binary over an
// npm wrapper (less noise, no cold start). Returns {ok} or {ok:false, out}.
function runContentValidate(projectRoot) {
  const tsxBin = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
  );
  try {
    if (fs.existsSync(tsxBin)) {
      execFileSync(tsxBin, ['scripts/validate-content.ts'], {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
        shell: process.platform === 'win32',
      });
    } else {
      execSync('npm run content:validate', {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      out: `${e.stdout || ''}${e.stderr || ''}`.trim() || String(e.message || e),
    };
  }
}

function main() {
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  let input;
  try {
    input = JSON.parse(readStdin());
  } catch {
    process.exit(0);
    return;
  }
  const filePath = input?.tool_input?.file_path ?? input?.tool_input?.path ?? '';
  if (!filePath) {
    process.exit(0);
    return;
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(projectRoot, filePath);
  const relPath = path.relative(projectRoot, absolutePath).split(path.sep).join('/');

  // content/**/*.json → full Zod content validation (matches CI + build).
  if (relPath.startsWith('content/') && relPath.endsWith('.json')) {
    const result = runContentValidate(projectRoot);
    if (!result.ok) {
      process.stderr.write(
        `Content validation failed after editing ${relPath} (scripts/validate-content.ts):\n\n${result.out}\n\n` +
          `Fix the reported field(s). Note: products & news require the filename stem to equal the JSON "slug" field.\n`,
      );
      process.exit(2);
      return;
    }
    process.exit(0);
    return;
  }

  // messages/*.json → translation key-parity check across locales.
  if (relPath.startsWith('messages/') && relPath.endsWith('.json')) {
    const result = checkMessageParity(projectRoot);
    if (!result.ok) {
      process.stderr.write(
        `i18n key-parity check failed after editing ${relPath}:\n\n${result.report}\n\n` +
          `Keep every locale key-parallel with messages/${REFERENCE_LOCALE}.json — add the missing keys (or remove orphaned ones).\n`,
      );
      process.exit(2);
      return;
    }
    process.exit(0);
    return;
  }

  process.exit(0);
}

try {
  main();
} catch {
  process.exit(0);
}
