const { R, vapid, hash } = require('../lib/push.js');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    const { action = 'subscribe', subscription: sub, team = '', events } = req.body || {};
    if (!sub || typeof sub.endpoint !== 'string' || !sub.endpoint.startsWith('https://')) return res.status(400).json({ error: '잘못된 구독 정보입니다.' });
    if (action === 'unsubscribe') { await R('HDEL', 'kbo:subs', hash(sub.endpoint)); return res.json({ ok: true }); }
    if (action === 'test') {
      await vapid().sendNotification(sub, JSON.stringify({ title: '⚾ 알림 테스트', body: '핸드폰 알림이 정상으로 오고 있어요!', tag: 'test', url: '/' }));
      return res.json({ ok: true });
    }
    const ev = Object.assign({ remind: true, start: true, score: true, end: true }, events || {});
    await R('HSET', 'kbo:subs', hash(sub.endpoint), JSON.stringify({ sub, team: String(team).slice(0, 10), events: ev, t: Date.now() }));
    return res.json({ ok: true });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
};
