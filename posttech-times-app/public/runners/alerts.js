// Background Runner가 웹뷰 밖에서 실행하는 파일. OS가 약 15분마다(정확하지 않음) 'checkAlerts'를 부른다.
// 포항공대신문 사이트의 전체 기사 RSS를 직접 읽어 새 기사가 있으면 로컬 알림을 띄운다.
// 마지막으로 확인한 기사 번호(idxno)는 CapacitorKV에 저장한다.
// 이 환경에는 DOM이 없고 fetch는 method·headers·body만 지원한다. 주소는 src/lib/alerts.ts의 FEED_URL과 같다.

var FEED_URL = 'https://times.postech.ac.kr/rss/allArticle.xml';
var MAX_SINGLE = 3;

function kvGet(key) {
  try {
    var item = CapacitorKV.get(key);
    return item && typeof item.value === 'string' ? item.value : '';
  } catch (e) {
    return '';
  }
}

function decode(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// RSS의 <item>에서 기사 번호와 제목만 뽑는다.
function parseFeed(xml) {
  var items = [];
  var blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  blocks.forEach(function (block) {
    var link = block.match(/<link>([\s\S]*?)<\/link>/);
    var title = block.match(/<title>([\s\S]*?)<\/title>/);
    var id = link && decode(link[1]).match(/idxno=(\d+)/);
    if (id && title) items.push({ id: Number(id[1]), title: decode(title[1]) });
  });
  return items;
}

function notificationsFor(articles) {
  if (articles.length > MAX_SINGLE) {
    var last = articles[articles.length - 1];
    return [{
      id: last.id,
      title: '포항공대신문 새 기사 ' + articles.length + '건',
      body: last.title + ' 외',
      autoCancel: true,
    }];
  }
  return articles.map(function (a) {
    return { id: a.id, title: '포항공대신문 새 기사', body: a.title, autoCancel: true };
  });
}

addEventListener('checkAlerts', async function (resolve, reject, args) {
  try {
    var res = await fetch(FEED_URL, { method: 'GET' });
    if (res.status !== 200) return resolve();
    var items = parseFeed(await res.text());
    // 사이트가 보안 장치 페이지로 돌려보낸 경우처럼 목록이 비면 기록을 건드리지 않는다.
    if (!items.length) return resolve();

    var latest = items.reduce(function (max, a) { return Math.max(max, a.id); }, 0);
    var last = Number(kvGet('lastArticleId') || '0');

    // 처음 실행하면 지난 기사를 몰아서 알리지 않고 위치만 기록한다.
    if (!last) {
      CapacitorKV.set('lastArticleId', String(latest));
      return resolve();
    }

    var fresh = items
      .filter(function (a) { return a.id > last; })
      .sort(function (a, b) { return a.id - b.id; });
    if (fresh.length) CapacitorNotifications.schedule(notificationsFor(fresh));
    CapacitorKV.set('lastArticleId', String(Math.max(last, latest)));
    resolve();
  } catch (err) {
    console.error('checkAlerts failed: ' + err);
    // 실패해도 다음 주기에 다시 확인하면 되므로 성공으로 끝낸다.
    resolve();
  }
});
