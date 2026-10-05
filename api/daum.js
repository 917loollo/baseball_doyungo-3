// Daum 스포츠(게임센터) 그래픽 스코어보드 프록시
module.exports = async (req, res) => {
  let gid = String(req.query?.gameId || '');
  // 네이버 gameId(예: 20261005HTLG02026) -> 다음 gameId(20261005HTLG0)
  const m = gid.match(/^(\d{8}[A-Z]{4}\d)/);
  if (!m) return res.status(400).json({ error: '잘못된 gameId' });
  gid = m[1];
  try {
    const r = await fetch(`https://gamecenter-api.sports2i.com/api/v2/during-game/graphic-scoreboard/1/0/${gid}/999`, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
        Referer: 'https://sports.daum.net/',
        Origin: 'https://sports.daum.net'
      }
    });
    const body = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: 'Daum 연결 실패', detail: String(e?.message || e) });
  }
};
