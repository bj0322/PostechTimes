// 배포 전에 요약 저장용 KV 네임스페이스를 찾고, 없으면 만든 뒤 그 id를 wrangler.toml에 넣는다.
// GitHub Actions 배포에서 쓰며, CLOUDFLARE_API_TOKEN과 CLOUDFLARE_ACCOUNT_ID가 필요하다.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const TITLE = 'posttech-times-summary';
const PLACEHOLDER = 'REPLACE_WITH_KV_NAMESPACE_ID';
const CONFIG = new URL('../wrangler.toml', import.meta.url);

function wrangler(...args) {
  return execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

function findNamespace() {
  const out = wrangler('kv', 'namespace', 'list');
  const list = JSON.parse(out.slice(out.indexOf('[')));
  return list.find(ns => ns.title === TITLE)?.id;
}

const config = readFileSync(CONFIG, 'utf8');
if (!config.includes(PLACEHOLDER)) {
  console.log('wrangler.toml에 이미 KV id가 있습니다.');
  process.exit(0);
}

let id = findNamespace();
if (!id) {
  console.log(`KV 네임스페이스 "${TITLE}"를 만듭니다.`);
  wrangler('kv', 'namespace', 'create', TITLE);
  id = findNamespace();
}
if (!id) throw new Error(`KV 네임스페이스 "${TITLE}"를 찾지 못했습니다.`);

writeFileSync(CONFIG, config.replace(PLACEHOLDER, id));
console.log(`KV 네임스페이스 "${TITLE}" (${id})를 연결했습니다.`);
