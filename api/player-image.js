module.exports = async (req,res)=>{
  const id=req.query?.playerId;
  if(!id || !/^\d+$/.test(String(id))) return res.status(400).json({error:'playerId가 필요합니다.'});
  const urls=[
    `https://sports-phinf.pstatic.net/player/kbo/default/${encodeURIComponent(id)}.png?type=f96_96`,
    `https://sports-phinf.pstatic.net/player/kbo/default/${encodeURIComponent(id)}.jpg?type=f96_96`
  ];
  for(const u of urls){
    try{
      const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://sports.news.naver.com/'}});
      if(r.ok){const b=Buffer.from(await r.arrayBuffer());res.status(200);res.setHeader('Content-Type',r.headers.get('content-type')||'image/png');res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');return res.send(b);}
    }catch(e){}
  }
  res.setHeader('Cache-Control','public, s-maxage=3600');return res.status(404).json({error:'선수 이미지를 찾을 수 없습니다.'});
};
