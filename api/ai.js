// Groq 프록시 (키는 Vercel 환경변수 GROQ_API_KEY 에만 둡니다). stream:true 면 텍스트를 실시간 전달.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  // 환경변수가 있으면 그것을 우선 사용합니다. 이 저장소를 공개(GitHub public)로 올리지 마세요.
  const key = process.env.GROQ_API_KEY || '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';
  if (!key) return res.status(500).json({ error: 'GROQ_API_KEY 환경변수가 설정되지 않았습니다.' });
  try {
    const { model = 'openai/gpt-oss-20b', messages = [], stream = false } = req.body || {};
    const selected = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'].includes(model) ? model : 'openai/gpt-oss-20b';
    const up = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: selected, messages: messages.slice(-24), temperature: 0.4, max_tokens: 2000, stream: !!stream })
    });
    if (!up.ok) { const d = await up.json().catch(() => ({})); return res.status(up.status).json({ error: d?.error?.message || 'Groq API 오류' }); }
    if (!stream) { const d = await up.json(); return res.status(200).json({ reply: d?.choices?.[0]?.message?.content || '' }); }
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const dec = new TextDecoder(); let buf = '';
    for await (const chunk of up.body) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop();
      for (const l of lines) {
        const s = l.trim(); if (!s.startsWith('data:')) continue;
        const p = s.slice(5).trim(); if (p === '[DONE]') continue;
        try { const t = JSON.parse(p)?.choices?.[0]?.delta?.content; if (t) res.write(t); } catch (e) {}
      }
    }
    return res.end();
  } catch (e) {
    if (!res.headersSent) return res.status(500).json({ error: e.message || 'AI 서버 오류' });
    return res.end();
  }
};
