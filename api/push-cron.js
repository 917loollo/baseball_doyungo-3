// 1분마다(또는 30초마다) 호출: 오늘 경기를 읽어 시작/득점/종료/30분 전 이벤트를 찾아 구독자에게 푸시를 보냅니다.
const { R, vapid } = require('../lib/push.js');
const TEAMS = ['LG', '두산', '삼성', 'SSG', 'KT', '한화', '롯데', 'KIA', 'NC', '키움'];
const short = n => TEAMS.find(t => String(n).includes(t)) || String(n || '');
const lk = o => { const m = {}; for (const k in o) m[k.toLowerCase()] = o[k]; return m; };
const pick = (m, ...n) => { for (const k of n) { const v = m[k.toLowerCase()]; if (v !== undefined && v !== null && v !== '') return v; } return null; };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
function parse(g) {
  const m = lk(g), x = String(pick(m, 'statusCode', 'status', 'gameStatus') || '').toUpperCase();
  const st = /RESULT|END|FINAL|FINISH/.test(x) ? 'end' : /START|LIVE|ING/.test(x) ? 'live' : 'pre';
  const n = v => (v === null || isNaN(Number(v)) ? 0 : Number(v));
  const ds = String(pick(m, 'gameDateTime', 'startTime') || '');
  return { id: String(pick(m, 'gameId')), a: short(pick(m, 'awayTeamName', 'awayName')), h: short(pick(m, 'homeTeamName', 'homeName')), st,
    as: n(pick(m, 'awayTeamScore', 'awayScore')), hs: n(pick(m, 'homeTeamScore', 'homeScore')), inn: String(pick(m, 'currentInning') || ''),
    start: ds.length >= 16 ? new Date(ds.slice(0, 19) + '+09:00').getTime() : 0, ok: pick(m, 'categoryId') === 'kbo' };
}
function events(prev, g) {
  const out = [], line = `${g.a} ${g.as} : ${g.hs} ${g.h}`, tag = 'g' + g.id;
  if (!prev) return out;
  if (prev.st === 'pre' && g.st === 'live') out.push({ k: 'start', title: '⚾ 경기 시작!', body: `${g.a} vs ${g.h}`, tag });
  else if (g.st === 'live' && (g.as !== prev.as || g.hs !== prev.hs)) {
    const who = g.as > prev.as ? g.a : g.hs > prev.hs ? g.h : '';
    out.push({ k: 'score', title: `🔥 ${who ? who + ' 득점!' : '점수 변동'}`, body: `${line}${g.inn ? ' · ' + g.inn : ''}`, tag });
  }
  if (prev.st !== 'end' && g.st === 'end') out.push({ k: 'end', title: '🏁 경기 종료', body: `${line} · ${g.as === g.hs ? '무승부' : (g.as > g.hs ? g.a : g.h) + ' 승'}`, tag });
  return out;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.CRON_SECRET, got = req.query.key || String(req.headers.authorization || '').replace('Bearer ', '');
  if (!key || got !== key) return res.status(401).json({ error: 'CRON_SECRET 이 필요합니다.' });
  try {
    const d = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    const r = await fetch(`https://api-gw.sports.naver.com/schedule/games?upperCategoryId=kbaseball&fromDate=${d}&toDate=${d}`, { headers: { 'User-Agent': UA, Referer: 'https://m.sports.naver.com/', Accept: 'application/json' }, signal: AbortSignal.timeout(7000) });
    const j = await r.json(), list = (j.result?.games || j.games || []).map(parse).filter(g => g.ok && g.id);
    const subsRaw = await R('HGETALL', 'kbo:subs'), subs = [];
    for (let i = 0; i < (subsRaw || []).length; i += 2) { try { subs.push({ f: subsRaw[i], ...JSON.parse(subsRaw[i + 1]) }); } catch (e) {} }
    const stRaw = (await R('HGET', 'kbo:state', d)) || '{}', state = JSON.parse(stRaw), all = [];
    for (const g of list) {
      const prev = state[g.id], ev = events(prev, g);
      if (g.st === 'pre' && g.start && g.start - Date.now() > 0 && g.start - Date.now() <= 31 * 60e3 && !(prev && prev.rem))
        ev.push({ k: 'remind', title: '⏰ 경기 30분 전', body: `${g.a} vs ${g.h}`, tag: 'g' + g.id });
      state[g.id] = { st: g.st, as: g.as, hs: g.hs, rem: (prev && prev.rem) || ev.some(e => e.k === 'remind') };
      ev.forEach(e => all.push({ ...e, g }));
    }
    await R('HSET', 'kbo:state', d, JSON.stringify(state));
    let sent = 0, removed = 0;
    if (all.length && subs.length) {
      const wp = vapid(), jobs = [];
      for (const e of all) for (const s of subs) {
        if (s.team && s.team !== e.g.a && s.team !== e.g.h) continue;
        if (s.events && s.events[e.k] === false) continue;
        jobs.push(wp.sendNotification(s.sub, JSON.stringify({ title: e.title, body: e.body, tag: e.tag, url: '/' })).then(() => { sent++; }, async err => {
          if (err.statusCode === 404 || err.statusCode === 410) { removed++; await R('HDEL', 'kbo:subs', s.f).catch(() => {}); }
        }));
      }
      await Promise.allSettled(jobs);
    }
    return res.json({ ok: true, date: d, games: list.length, events: all.map(e => e.title + ' ' + e.body), subscribers: subs.length, sent, removed });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
};
