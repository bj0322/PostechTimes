// Background Runner가 웹뷰 밖에서 실행하는 파일. OS가 약 15분마다(정확하지 않음) 'checkAlerts'를 부른다.
// 서버(summary-server)의 /alerts에서 새 기사·속보를 받아 로컬 알림을 띄운다.
// 서버 주소는 앱이 실행될 때 dispatchEvent로 넘겨주고, 여기서 CapacitorKV에 저장해 둔다.
// 이 환경에는 DOM이 없고 fetch는 method·headers·body만 지원한다.

var MAX_SINGLE = 3;

function kvGet(key) {
  try {
    var item = CapacitorKV.get(key);
    return item && typeof item.value === 'string' ? item.value : '';
  } catch (e) {
    return '';
  }
}

function notificationsFor(alerts) {
  var breaking = alerts.filter(function (a) { return a.breaking; });
  var normal = alerts.filter(function (a) { return !a.breaking; });
  var list = breaking.slice(-5).map(function (a) {
    return { id: a.seq, title: a.title, body: a.body, autoCancel: true };
  });
  if (normal.length > MAX_SINGLE) {
    var last = normal[normal.length - 1];
    list.push({
      id: last.seq,
      title: '포항공대신문 새 기사 ' + normal.length + '건',
      body: last.body + ' 외',
      autoCancel: true,
    });
  } else {
    normal.forEach(function (a) {
      list.push({ id: a.seq, title: a.title, body: a.body, autoCancel: true });
    });
  }
  return list;
}

addEventListener('checkAlerts', async function (resolve, reject, args) {
  try {
    if (args && typeof args.serverUrl === 'string' && args.serverUrl) {
      CapacitorKV.set('serverUrl', args.serverUrl);
    }
    var server = kvGet('serverUrl');
    if (!server) return resolve();

    var last = Number(kvGet('lastAlertSeq') || '0');
    var res = await fetch(server + '/alerts?after=' + last, { method: 'GET' });
    if (res.status !== 200) return resolve();
    var data = JSON.parse(await res.text());
    var latest = Number(data.latest) || 0;

    // 처음 실행(또는 서버 데이터를 지운 뒤)에는 지난 알림을 몰아서 띄우지 않고 위치만 기록한다.
    if (!kvGet('lastAlertSeq') || latest < last) {
      CapacitorKV.set('lastAlertSeq', String(latest));
      return resolve();
    }

    var alerts = Array.isArray(data.alerts) ? data.alerts : [];
    if (alerts.length) CapacitorNotifications.schedule(notificationsFor(alerts));
    CapacitorKV.set('lastAlertSeq', String(latest));
    resolve();
  } catch (err) {
    console.error('checkAlerts failed: ' + err);
    // 실패해도 다음 주기에 다시 확인하면 되므로 성공으로 끝낸다.
    resolve();
  }
});
