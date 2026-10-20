import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanParagraphs, decodeEntities, stripSiteSuffix } from '../src/text.ts';

test('decodes the entities the article pages use', () => {
  assert.equal(decodeEntities('&lsquo;마리오 카트&rsquo; &ldquo;승리&rdquo; 축구&middot;야구'), '‘마리오 카트’ “승리” 축구·야구');
  assert.equal(decodeEntities('A &amp; B &#44; &#x2014;'), 'A & B , —');
  assert.equal(decodeEntities('&unknown; &#0;'), '&unknown; &#0;');
});

test('drops empty and copyright paragraphs', () => {
  assert.deepEqual(
    cleanParagraphs(['&nbsp;', '  첫 문단\n  이어짐 ', '', '저작권자 &copy; 포항공대신문']),
    ['첫 문단 이어짐'],
  );
});

test('strips the site name from titles', () => {
  assert.equal(stripSiteSuffix('5년 만의 우승 - 포항공대신문'), '5년 만의 우승');
  assert.equal(stripSiteSuffix('Title &amp; More'), 'Title & More');
});
