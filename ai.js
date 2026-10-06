module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({error:'GROQ_API_KEY 환경변수가 설정되지 않았습니다.'});
  try {
    const { model='openai/gpt-oss-20b', messages=[] } = req.body || {};
    const safeModels = new Set(['openai/gpt-oss-20b','openai/gpt-oss-120b']);
    const selected = safeModels.has(model) ? model : 'openai/gpt-oss-20b';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:selected,messages,temperature:0.4,max_tokens:1200})
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({error:data?.error?.message||'Groq API 오류'});
    return res.status(200).json({reply:data?.choices?.[0]?.message?.content||''});
  } catch (e) { return res.status(500).json({error:e.message||'AI 서버 오류'}); }
};
