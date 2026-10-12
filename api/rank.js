// 네이버 스포츠 KBO 팀 순위 동기화: API 후보와 순위 페이지(__NEXT_DATA__)를 차례로 읽고, 응답 구조를 자동으로 찾아 표준 형태로 돌려줍니다.
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const lk = o => { const m = {}; for (const k in o) m[k.toLowerCase()] = o[k]; return m; };
const pick = (m, names) => { for (const n of names) { const v = m[n.toLowerCase()]; if (v !== undefined && v !== null && v !== '') return v; } return null; };
const num = v => (v === null || v === '' || isNaN(Number(v))) ? null : Number(v);
function norm(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const m = lk(o);
  const team = pick(m, ['teamName', 'teamNm', 'teamFullName', 'name', 'teamShortName']);
  const w = num(pick(m, ['winGameCount', 'wins', 'win', 'w', 'winCount', 'winCnt']));
  const l = num(pick(m, ['loseGameCount', 'losses', 'lose', 'l', 'loseCount', 'loseCnt']));
  if (!team || typeof team !== 'string' || w === null || l === null) return null;
  const t = num(pick(m, ['drawnGameCount', 'drawGameCount', 'draw', 'drawn', 'tie', 'ties', 't', 'drawCount', 'drawCnt'])) || 0;
  const gp = num(pick(m, ['gameCount', 'gameplayCount', 'games', 'gameNum', 'game', 'playCount'])) ?? (w + l + t);
  let pct = num(pick(m, ['wra', 'winRate', 'winPct', 'pct', 'winningPercentage']));
  if (pct === null) pct = (w + l) ? w / (w + l) : 0;
  return { team, rank: num(pick(m, ['ranking', 'rank', 'rankNo', 'order'])), gp, w, l, t, pct,
    gb: num(pick(m, ['gameBehind', 'gb', 'gameDiff', 'gamesBehind'])) ?? 0,
    streak: String(pick(m, ['continuousGameResult', 'streak', 'continuousResult', 'continuous']) ?? '') };
}
function walk(o, out) {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) {
    const rows = o.map(norm).filter(Boolean);
    if (rows.length >= 8) { out.push(rows); return; }
    o.forEach(x => walk(x, out)); return;
  }
  Object.keys(o).forEach(k => walk(o[k], out));
}
function scanText(text) {
  const t = text.replace(/\\"/g, '"'), rows = [], seen = new Set();
  for (const m of t.matchAll(/\{[^{}]*"teamName"[^{}]*\}/g)) {
    try { const r = norm(JSON.parse(m[0])); if (r && !seen.has(r.team)) { seen.add(r.team); rows.push(r); } } catch (e) {}
  }
  return rows.length >= 8 ? rows : null;
}
function extract(body) {
  const out = [];
  try { walk(JSON.parse(body), out); } catch (e) {}
  if (!out.length) {
    const nd = body.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nd) { try { walk(JSON.parse(nd[1]), out); } catch (e) {} }
  }
  if (!out.length) { const s = scanText(body); if (s) out.push(s); }
  return out.sort((a, b) => b.length - a.length)[0] || null;
}
let cache = null;
module.exports = async (req, res) => {
  const season = /^\d{4}$/.test(req.query.season || '') ? req.query.season : String(new Date().getFullYear());
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cache && cache.season === season && Date.now() - cache.t < 20000) { res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60'); return res.status(200).send(cache.body); }
  const urls = [
    `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${season}/teams`,
    `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${season}/teams?sortField=ranking&sortDirection=asc`,
    `https://m.sports.naver.com/kbaseball/record/kbo?seasonCode=${season}&tab=teamRank`
  ];
  const tried = [];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json,text/html,*/*', 'Accept-Language': 'ko-KR,ko;q=0.9', Referer: 'https://m.sports.naver.com/' }, signal: AbortSignal.timeout(6000) });
      const body = await r.text();
      const rows = r.ok ? extract(body) : null;
      tried.push({ url: u, status: r.status, found: rows ? rows.length : 0 });
      if (rows) {
        rows.forEach((x, i) => { if (x.rank === null) x.rank = i + 1; });
        rows.sort((a, b) => a.rank - b.rank);
        const out = JSON.stringify({ ok: true, season, source: u, fetchedAt: new Date().toISOString(), teams: rows });
        cache = { season, t: Date.now(), body: out };
        res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60');
        return res.status(200).send(out);
      }
    } catch (e) { tried.push({ url: u, error: String(e.message || e) }); }
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(JSON.stringify({ ok: false, season, tried }));
};
