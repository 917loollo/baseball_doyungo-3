// Daum 스포츠(게임센터, sports2i) 프록시 — 포스트시즌 전용
// 실제 Daum 페이지(경기 중 HAR)가 호출하는 주소로 확인됨:
//   graphic-scoreboard/1/5/20261101HTSS0/999  ,  graphic-Live?...SR_ID=5&G_ID=20261101HTSS0...
// 즉 G_ID 는 '연도MMDD+팀코드+0', SR_ID 는 시리즈 코드(플레이오프=5). 네이버 ID '5555MMDD…' 의 앞 4자리가 시리즈 코드(5)를 4번 반복한 값입니다.
// (Daum 의 cpGameId '55551101HTSS0' 는 game-type 조회용 키이며 스코어보드 G_ID 가 아님.) 3333/4444/7777 은 추정이라 실패 시 다른 코드도 시도합니다.
const BASE = 'https://gamecenter-api.sports2i.com/api/v2';
const HDR = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
  Referer: 'https://sports.daum.net/',
  Origin: 'https://sports.daum.net'
};
module.exports = async (req, res) => {
  const m = String(req.query?.gameId || '').match(/^(\d{4})(\d{4})([A-Z]{4})(\d)(\d{4})?$/);
  if (!m) return res.status(400).json({ error: '잘못된 gameId' });
  const [, prefix, mmdd, teams, dh, yy] = m;
  const year = /^20\d\d$/.test(prefix) ? prefix : (yy || String(req.query?.year || '') || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 4));
  const gidRaw = prefix + mmdd + teams + dh;            // 55551101HTSS0 (Daum cpGameId 형식)
  const gidDate = year + mmdd + teams + dh;             // 20261101HTSS0 (대비용)
  const gids = [...new Set([gidDate, gidRaw])];
  const first = /^(\d)\1{3}$/.test(prefix) ? Number(prefix[0]) : null;           // 5555 → 5
  const srs = [...new Set([first, 5, 7, 3, 4, 9].filter(x => x !== null))];        // 시리즈 코드 후보
  res.setHeader('Cache-Control', 'no-store');
  const get = async (gid, sr) => {
    const r = await fetch(`${BASE}/during-game/graphic-scoreboard/1/${sr}/${gid}/999`, { headers: HDR, signal: AbortSignal.timeout(2500) });
    if (!r.ok) return null;
    const j = await r.json();
    return j && typeof j === 'object' ? { gid, sr, sb: j } : null;
  };
  try {
    let hit = first !== null ? await get(gidDate, first).catch(() => null) : null;      // 확인된 조합(날짜형 ID + 시리즈 코드) 먼저
    if (!hit) {
      const combos = [];
      for (const g of gids) for (const s of srs) if (!(g === gidDate && s === first)) combos.push([g, s]);
      hit = (await Promise.all(combos.map(([g, s]) => get(g, s).catch(() => null)))).find(Boolean) || null;
    }
    if (!hit) return res.status(404).json({ error: '포스트시즌 scoreboard 없음', tried: { gids, srs } });
    const sb = hit.sb, gid = hit.gid; sb._sr = hit.sr; sb._gid = gid; sb._balls = [];
    try {
      const q = new URLSearchParams({
        LE_ID: 1, SR_ID: hit.sr, G_ID: gid,
        SEQ_NO: sb.seqNo || 0, INN_NO: sb.innNo || 1, TB_SC: sb.tbSc || 'T',
        BAT_P_ID: sb.batterInfo?.pId || 0, BAT_AROUND_NO: sb.batterInfo?.aroundNo || 0
      });
      const b = await fetch(`${BASE}/during-game/graphic-Live?${q}`, { headers: HDR, signal: AbortSignal.timeout(2500) });
      const bj = await b.json();
      sb._balls = (bj.ResultSet1 || [])
        .filter(x => String(x.HOW_ID || '').trim() === '' && String(x.PIT_RESULT_SC || '').trim() !== '' && x.SEQ_NO <= sb.seqNo && x.PA_PIT_NO !== 0)
        .sort((a, c) => a.PA_PIT_NO - c.PA_PIT_NO);
    } catch (e) { /* 투구 위치만 실패해도 스코어보드는 반환 */ }
    return res.status(200).json(sb);
  } catch (e) {
    return res.status(502).json({ error: 'Daum 연결 실패', detail: String(e?.message || e) + (e?.cause ? ' [' + (e.cause.code || e.cause.message || e.cause) + ']' : '') });
  }
};
