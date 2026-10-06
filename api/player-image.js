// 선수 사진 프록시: 여러 출처를 병렬로 시도해 처음 성공한 이미지를 돌려줍니다. ?debug=1 이면 시도 결과를 JSON 으로 보여줍니다.
const yr = new Date().getFullYear();
const NV = 'https://sports-phinf.pstatic.net/player/kbo/default';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36';
const cands = id => [
  { u: `${NV}/${id}.png?type=f96_96`, r: 'https://sports.news.naver.com/' },
  ...[yr, yr - 1, yr - 2].map(y => ({ u: `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/${y}/${id}.jpg`, r: 'https://www.koreabaseball.com/' })),
  { u: `${NV}/${id}.jpg?type=f96_96`, r: 'https://sports.news.naver.com/' },
  ...[yr, yr - 1].map(y => ({ u: `${NV}/${y}/${id}.png?type=f96_96`, r: 'https://sports.news.naver.com/' })),
  { u: `${NV}/${id}.png?type=w150`, r: 'https://m.sports.naver.com/' }
];
async function tryOne(c) {
  const r = await fetch(c.u, { headers: { 'User-Agent': UA, Referer: c.r, Accept: 'image/*,*/*' }, signal: AbortSignal.timeout(3500) });
  const ct = r.headers.get('content-type') || '';
  if (!r.ok || !ct.startsWith('image/')) return { c, status: r.status, ct };
  const b = Buffer.from(await r.arrayBuffer());
  if (b.length < 600) return { c, status: r.status, ct, tiny: b.length };
  return { c, ok: true, b, ct, status: r.status };
}
module.exports = async (req, res) => {
  const id = req.query?.playerId;
  if (!id || !/^\d+$/.test(String(id))) return res.status(400).json({ error: 'playerId가 필요합니다.' });
  const rs = await Promise.all(cands(id).map(c => tryOne(c).catch(e => ({ c, err: String(e?.message || e) }))));
  if (req.query?.debug) return res.status(200).json(rs.map(x => ({ url: x.c.u, ok: !!x.ok, status: x.status, type: x.ct, err: x.err, tiny: x.tiny })));
  const hit = rs.find(x => x.ok);
  if (hit) {
    res.status(200);
    res.setHeader('Content-Type', hit.ct);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.send(hit.b);
  }
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  return res.status(404).json({ error: '선수 이미지를 찾을 수 없습니다.' });
};
