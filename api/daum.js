// Daum 스포츠(게임센터, sports2i) 프록시
// 정규시즌은 SR_ID=0, 포스트시즌은 SR_ID=5(2026 플레이오프 캡처로 확인).
// 정규시즌/포스트시즌을 자동 판별하고, scoreboard가 비어 있는 200 응답이면 다음 후보를 시도한다.
const BASE = 'https://gamecenter-api.sports2i.com/api/v2';
const HDR = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36',
  Referer: 'https://sports.daum.net/',
  Origin: 'https://sports.daum.net'
};

const validBoard = (j) => !!(
  j && typeof j === 'object' &&
  j.away && j.home &&
  j.batterInfo && j.pitcherInfo
);

module.exports = async (req, res) => {
  const m = String(req.query?.gameId || '').match(/^(20\d{6}[A-Z]{4}\d)/);
  if (!m) return res.status(400).json({ error: '잘못된 gameId' });
  const gid = m[1];
  res.setHeader('Cache-Control', 'no-store');

  const getBoard = async (sr) => {
    const r = await fetch(
      `${BASE}/during-game/graphic-scoreboard/1/${sr}/${gid}/999`,
      { headers: HDR, signal: AbortSignal.timeout(3500) }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return validBoard(j) ? { sr, sb: j } : null;
  };

  try {
    // 0=정규시즌, 5=포스트시즌. 실제 캡처에서 20261101HTSS0은 SR_ID=5로 성공.
    const results = await Promise.all([getBoard(0), getBoard(5)]);
    let hit = results.find(Boolean);
    // 향후 다른 시리즈 코드가 사용될 경우를 위한 보조 후보
    if (!hit) {
      for (const sr of [7, 3, 4, 9]) {
        hit = await getBoard(sr).catch(() => null);
        if (hit) break;
      }
    }
    if (!hit) return res.status(404).json({
      error: 'Daum scoreboard 데이터가 없습니다.',
      gameId: gid,
      tried: [0, 5, 7, 3, 4, 9]
    });

    const sb = hit.sb;
    sb._sr = hit.sr;
    sb._gid = gid;
    if (!sb.G_ID) sb.G_ID = gid;
    sb._balls = [];

    try {
      const q = new URLSearchParams({
        LE_ID: 1,
        SR_ID: hit.sr,
        G_ID: gid,
        SEQ_NO: sb.seqNo || 0,
        INN_NO: sb.innNo || 1,
        TB_SC: sb.tbSc || 'T',
        BAT_P_ID: sb.batterInfo?.pId || 0,
        BAT_AROUND_NO: sb.batterInfo?.aroundNo || 0
      });
      const b = await fetch(`${BASE}/during-game/graphic-Live?${q}`, {
        headers: HDR,
        signal: AbortSignal.timeout(3000)
      });
      if (b.ok) {
        const bj = await b.json();
        sb._balls = (bj.ResultSet1 || [])
          .filter(x =>
            String(x.HOW_ID || '').trim() === '' &&
            String(x.PIT_RESULT_SC || '').trim() !== '' &&
            x.SEQ_NO <= sb.seqNo &&
            x.PA_PIT_NO !== 0
          )
          .sort((a, c) => a.PA_PIT_NO - c.PA_PIT_NO);
      }
    } catch (e) {
      // 투구 위치 요청 실패 시에도 스코어보드는 반환
    }
    res.setHeader('X-Daum-SR-ID', String(hit.sr));
    return res.status(200).json(sb);
  } catch (e) {
    return res.status(502).json({
      error: 'Daum 연결 실패',
      detail: String(e?.message || e) + (e?.cause ? ' [' + (e.cause.code || e.cause.message || e.cause) + ']' : '')
    });
  }
};
