// 네이버 스포츠 API 프록시: JSON 검증 · 1회 재시도 · 동시 요청 합치기 · 실패 시 최근 정상 응답(최대 2분) 대체
const cache = new Map(), inflight = new Map();
const HEADERS = [{
  Accept: 'application/json, text/plain, */*', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
  Referer: 'https://m.sports.naver.com/', Origin: 'https://m.sports.naver.com'
}, {
  Accept: 'application/json', 'Accept-Language': 'ko-KR,ko;q=0.9',
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
  Referer: 'https://sports.naver.com/'
}];
async function pull(path) {
  let err = '';
  for (let i = 0; i < HEADERS.length; i++) {
    try {
      const r = await fetch('https://api-gw.sports.naver.com' + path, { headers: HEADERS[i], signal: AbortSignal.timeout(6000) });
      const body = await r.text();
      if (!body.trim().startsWith('<')) { try { JSON.parse(body); return { status: r.status, body }; } catch (e) {} }
      err = `네이버 응답이 JSON이 아닙니다 (HTTP ${r.status})`;
    } catch (e) { err = String(e?.message || e); }
  }
  throw new Error(err);
}
module.exports = async (req, res) => {
  const path = req.query.path;
  if (!path || typeof path !== 'string' || !path.startsWith('/') || path.includes('://') || path.includes('\\')) {
    return res.status(400).json({ error: '잘못된 API 경로입니다.' });
  }
  const hit = cache.get(path);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (hit && Date.now() - hit.t < 1500) { res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=2, stale-while-revalidate=8'); return res.status(hit.status).send(hit.body); }
  try {
    let p = inflight.get(path);
    if (!p) { p = pull(path).finally(() => inflight.delete(path)); inflight.set(path, p); }
    const out = await p;
    if (out.status < 400) cache.set(path, { ...out, t: Date.now() });
    if (cache.size > 300) cache.delete(cache.keys().next().value);
    res.setHeader('Cache-Control', out.status < 400 ? 'public, max-age=0, s-maxage=2, stale-while-revalidate=8' : 'no-store');
    return res.status(out.status).send(out.body);
  } catch (e) {
    if (hit && Date.now() - hit.t < 120000) { res.setHeader('X-Stale', '1'); res.setHeader('Cache-Control', 'no-store'); return res.status(hit.status).send(hit.body); }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'KBO 데이터 서버 연결 실패: ' + String(e?.message || e) });
  }
};
