import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'alerts-test-'));
process.env.DATA_DIR = dir;
const { recordArticles, addManualAlert, alertsAfter } = await import('../src/alerts.ts');

test.after(() => rm(dir, { recursive: true, force: true }));

test('first scan only seeds, later scans alert on new articles', async () => {
  assert.deepEqual(await recordArticles([{ id: '100', title: '기존 기사', section: '보도' }]), []);
  assert.equal((await alertsAfter(0)).alerts.length, 0);

  const made = await recordArticles([
    { id: '100', title: '기존 기사', section: '보도' },
    { id: '102', title: '둘째 새 기사', section: '대학' },
    { id: '101', title: '첫째 새 기사', section: '보도' },
  ]);
  assert.deepEqual(made.map(a => a.articleId), ['101', '102']);
  assert.equal(made[0].body, '첫째 새 기사');

  const { latest, alerts } = await alertsAfter(1);
  assert.equal(latest, 2);
  assert.deepEqual(alerts.map(a => a.seq), [2]);
});

test('manual alerts are breaking and validate input', async () => {
  const alert = await addManualAlert({ body: '총장 선출 결과 발표', articleId: '24341' });
  assert.equal(alert.breaking, true);
  assert.equal(alert.title, '[속보] 포항공대신문');
  assert.equal(alert.articleId, '24341');
  await assert.rejects(addManualAlert({ body: '  ' }));
  assert.equal((await addManualAlert({ body: '공지', articleId: 'x' })).articleId, null);
});
