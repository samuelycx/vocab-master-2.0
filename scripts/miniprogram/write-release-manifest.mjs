import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MINIPROGRAM_RELEASE_SCOPES = ['miniprogram', 'cloudfunctions', 'full'];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

function normalizeCloudFunctions(input = []) {
  return [...new Set((Array.isArray(input) ? input : []).map(normalizeText).filter(Boolean))].sort();
}

function pushError(errors, field, code) {
  errors.push({
    field,
    code
  });
}

export function buildMiniprogramReleaseManifest({
  commit,
  scope,
  releasedAt,
  sourceOfTruth = 'origin/main',
  cloudFunctions = []
} = {}) {
  return {
    commit: normalizeText(commit),
    scope: normalizeText(scope),
    releasedAt: normalizeText(releasedAt),
    sourceOfTruth: normalizeText(sourceOfTruth) || 'origin/main',
    cloudFunctions: normalizeCloudFunctions(cloudFunctions)
  };
}

export function validateMiniprogramReleaseManifest(input = {}) {
  const manifest = buildMiniprogramReleaseManifest(input);
  const errors = [];

  if (!manifest.commit) {
    pushError(errors, 'commit', 'INVALID_COMMIT');
  }

  if (!MINIPROGRAM_RELEASE_SCOPES.includes(manifest.scope)) {
    pushError(errors, 'scope', 'INVALID_SCOPE');
  }

  if (!manifest.releasedAt) {
    pushError(errors, 'releasedAt', 'INVALID_RELEASED_AT');
  }

  if (!manifest.sourceOfTruth) {
    pushError(errors, 'sourceOfTruth', 'INVALID_SOURCE_OF_TRUTH');
  }

  if (manifest.cloudFunctions.length === 0) {
    pushError(errors, 'cloudFunctions', 'INVALID_CLOUD_FUNCTIONS');
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function assertProductionManifestAllowed({
  gitStatusOutput = '',
  dryRun = false
} = {}) {
  const normalizedStatus = normalizeText(gitStatusOutput);
  if (!dryRun && normalizedStatus) {
    throw new Error(`DIRTY_WORKING_TREE: ${normalizedStatus}`);
  }
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    scope: 'full',
    outputPath: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (value === '--scope') {
      options.scope = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (value === '--output') {
      options.outputPath = argv[index + 1] || '';
      index += 1;
      continue;
    }

    if (value === '-h' || value === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unsupported argument: ${value}`);
  }

  return options;
}

function resolveRepoRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
}

function runGit(repoRoot, ...args) {
  return execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8'
  }).trimEnd();
}

function listCloudFunctions(miniprogramRoot) {
  const cloudFunctionsRoot = join(miniprogramRoot, 'src', 'static', 'cloudfunctions');
  return readdirSync(cloudFunctionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function generateMiniprogramReleaseManifest({
  repoRoot = resolveRepoRoot(),
  miniprogramRoot = join(repoRoot, 'miniprogram'),
  scope = 'full',
  dryRun = false,
  outputPath = join(miniprogramRoot, 'release-manifest.json')
} = {}) {
  const gitStatusOutput = runGit(repoRoot, 'status', '--short');
  assertProductionManifestAllowed({
    gitStatusOutput,
    dryRun
  });

  const manifest = buildMiniprogramReleaseManifest({
    commit: runGit(repoRoot, 'rev-parse', 'HEAD'),
    scope,
    releasedAt: new Date().toISOString(),
    cloudFunctions: listCloudFunctions(miniprogramRoot)
  });
  const validation = validateMiniprogramReleaseManifest(manifest);

  if (!validation.ok) {
    throw new Error(`INVALID_MINIPROGRAM_RELEASE_MANIFEST: ${JSON.stringify(validation.errors)}`);
  }

  const payload = `${JSON.stringify(manifest, null, 2)}\n`;

  if (!dryRun) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, payload);
  }

  return {
    manifest,
    payload,
    outputPath
  };
}

function printHelp() {
  console.log(`Usage:
  node scripts/miniprogram/write-release-manifest.mjs [--dry-run] [--scope <scope>] [--output <path>]

Supported scope values:
  ${MINIPROGRAM_RELEASE_SCOPES.join(', ')}
`);
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exit(0);
    }

    const { payload, outputPath, manifest } = generateMiniprogramReleaseManifest({
      dryRun: options.dryRun,
      scope: options.scope,
      outputPath: options.outputPath || undefined
    });

    if (options.dryRun) {
      process.stdout.write(payload);
    } else {
      console.log(`release_manifest_path=${outputPath}`);
      console.log(`release_manifest_commit=${manifest.commit}`);
      console.log(`release_manifest_scope=${manifest.scope}`);
    }
  } catch (error) {
    console.error(String(error instanceof Error ? error.message : error));
    process.exit(1);
  }
}
