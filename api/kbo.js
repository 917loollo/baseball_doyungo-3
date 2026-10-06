module.exports = async (req, res) => {
  const path = req.query.path;
  if (!path || typeof path !== 'string' || !path.startsWith('/') || path.includes('://') || path.includes('\\')) {
    return res.status(400).json({ error: '잘못된 API 경로입니다.' });
  }
  try {
    const r = await fetch('https://api-gw.sports.naver.com' + path, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
        Referer: 'https://m.sports.naver.com/',
        Origin: 'https://m.sports.naver.com'
      }
    });
    const body = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=2, stale-while-revalidate=8');
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: 'KBO API 연결 실패', detail: String(e?.message || e) });
  }
};
