import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanParagraphs, stripSiteSuffix } from '../src/text.ts';
import { detectLanguage, keywordsIn } from '../src/summarize.ts';

test('keywordsIn drops Korean keywords for English articles only', () => {
  assert.deepEqual(keywordsIn('English', ['Scale AI', '노동 조건', 'BPO']), ['Scale AI', 'BPO']);
  assert.deepEqual(keywordsIn('Korean', ['카포전', 'e-sports']), ['카포전', 'e-sports']);
});

test('detectLanguage picks the article language', () => {
  assert.equal(detectLanguage('우리대학은 제23회 카포전에서 종합 우승을 차지했다.'), 'Korean');
  assert.equal(detectLanguage('The Human Cost of AI Data Labeling in 2025'), 'English');
  assert.equal(detectLanguage('POSTECH의 AI 연구 Lab이 Nature에 논문을 발표했다'), 'Korean');
});

test('cleanParagraphs collapses whitespace and drops copyright lines', () => {
  assert.deepEqual(
    cleanParagraphs(['  첫  번째\n문단 ', '', '<저작권자 © 포항공대신문>']),
    ['첫 번째 문단'],
  );
});

test('stripSiteSuffix removes the site name from titles', () => {
  assert.equal(stripSiteSuffix('기사 제목 - 포항공대신문'), '기사 제목');
  assert.equal(stripSiteSuffix('기사 제목'), '기사 제목');
});
