// Cloudflare Worker: 네이버 스포츠 API 중계 (Vercel 이 막힐 때 대체용)
export default {
  async fetch(req) {
    const u = new URL(req.url), path = u.searchParams.get('path') || '';
    const cors = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8' };
    if (!path.startsWith('/') || path.includes('://')) return new Response('{"error":"잘못된 경로"}', { status: 400, headers: cors });
    try {
      const r = await fetch('https://api-gw.sports.naver.com' + path, {
        headers: { Accept: 'application/json', 'Accept-Language': 'ko-KR,ko;q=0.9',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
          Referer: 'https://m.sports.naver.com/', Origin: 'https://m.sports.naver.com' },
        cf: { cacheTtl: 2, cacheEverything: true }
      });
      return new Response(await r.text(), { status: r.status, headers: { ...cors, 'Cache-Control': 'public, max-age=2' } });
    } catch (e) { return new Response(JSON.stringify({ error: '중계 실패: ' + e }), { status: 502, headers: cors }); }
  }
};
