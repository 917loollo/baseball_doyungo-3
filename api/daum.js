// Daum 스포츠(게임센터, sports2i) 프록시: 스코어보드 + 현재 타석 투구 위치
const BASE = 'https://gamecenter-api.sports2i.com/api/v2';
const HDR = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
  Referer: 'https://sports.daum.net/',
  Origin: 'https://sports.daum.net'
};
module.exports = async (req, res) => {
  const m = String(req.query?.gameId || '').match(/^(\d{8}[A-Z]{4}\d)/);
  if (!m) return res.status(400).json({ error: '잘못된 gameId' });
  const gid = m[1];
  res.setHeader('Cache-Control', 'no-store');
  try {
    const r = await fetch(`${BASE}/during-game/graphic-scoreboard/1/0/${gid}/999`, { headers: HDR });
    if (!r.ok) return res.status(r.status).json({ error: 'scoreboard ' + r.status });
    const sb = await r.json();
    sb._balls = [];
    try {
      const q = new URLSearchParams({
        LE_ID: 1, SR_ID: 0, G_ID: gid,
        SEQ_NO: sb.seqNo || 0, INN_NO: sb.innNo || 1, TB_SC: sb.tbSc || 'T',
        BAT_P_ID: sb.batterInfo?.pId || 0, BAT_AROUND_NO: sb.batterInfo?.aroundNo || 0
      });
      const b = await fetch(`${BASE}/during-game/graphic-Live?${q}`, { headers: HDR });
      const bj = await b.json();
      sb._balls = (bj.ResultSet1 || [])
        .filter(x => String(x.HOW_ID || '').trim() === '' && String(x.PIT_RESULT_SC || '').trim() !== '' && x.SEQ_NO <= sb.seqNo && x.PA_PIT_NO !== 0)
        .sort((a, c) => a.PA_PIT_NO - c.PA_PIT_NO);
    } catch (e) { /* 투구 위치만 실패해도 스코어보드는 반환 */ }
    return res.status(200).json(sb);
  } catch (e) {
    return res.status(502).json({ error: 'Daum 연결 실패', detail: String(e?.message || e) });
  }
};
