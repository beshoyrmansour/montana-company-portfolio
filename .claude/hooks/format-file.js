// PostToolUse hook: silently auto-format the single file Claude just wrote/edited
// with Prettier. Keeps in-progress edits clean and Tailwind class ordering
// (prettier-plugin-tailwindcss) consistent. This is a non-blocking nicety —
// it NEVER exits non-zero and NEVER surfaces feedback to Claude. Any failure
// (prettier missing, parse error, unsupported file) is swallowed with exit 0.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Extensions Prettier is wired up to handle in this repo.
const FORMATTABLE_EXTS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.css',
  '.yml',
  '.yaml',
]);

// Directory prefixes (repo-relative) that must never be reformatted.
const SKIP_PREFIXES = ['node_modules/', '.next/', '.wolf/', 'dist/', 'build/'];

function main() {
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // 1. Read + parse hook stdin. Fail open on any problem.
  let raw;
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch {
    process.exit(0);
    return;
  }
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
    return;
  }

  const filePath = input?.tool_input?.file_path ?? input?.tool_input?.path ?? '';
  if (!filePath) {
    process.exit(0);
    return;
  }

  // 2. Resolve to absolute + repo-relative paths.
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(projectRoot, filePath);
  const relPath = path.relative(projectRoot, absolutePath).split(path.sep).join('/');

  // 3. Skip anything outside the project root.
  if (relPath.startsWith('../') || relPath === '..' || path.isAbsolute(relPath)) {
    process.exit(0);
    return;
  }

  // 4. Skip protected directories.
  for (const prefix of SKIP_PREFIXES) {
    if (relPath.startsWith(prefix)) {
      process.exit(0);
      return;
    }
  }

  // 5. Only format extensions Prettier handles here.
  const ext = path.extname(absolutePath).toLowerCase();
  if (!FORMATTABLE_EXTS.has(ext)) {
    process.exit(0);
    return;
  }

  // 6. Skip if the file no longer exists (e.g. edited then deleted).
  try {
    if (!fs.statSync(absolutePath).isFile()) {
      process.exit(0);
      return;
    }
  } catch {
    process.exit(0);
    return;
  }

  // 7. Resolve the LOCAL prettier binary. Never `npx` — it adds cold-start
  //    latency on every edit and can try a registry install if prettier is
  //    absent. If it isn't installed, skip silently.
  const prettierBin = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'prettier.cmd' : 'prettier',
  );
  try {
    if (!fs.existsSync(prettierBin)) {
      process.exit(0);
      return;
    }
  } catch {
    process.exit(0);
    return;
  }

  // 8. Run prettier --write silently. Any failure is a no-op — never block Claude.
  try {
    execFileSync(prettierBin, ['--write', relPath], {
      cwd: projectRoot,
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });
  } catch {
    // parse error, config issue, etc. — swallow it.
  }

  process.exit(0);
}

try {
  main();
} catch {
  process.exit(0);
}
