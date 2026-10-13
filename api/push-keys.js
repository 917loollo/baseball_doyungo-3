// 처음 한 번만: 이 주소를 열면 새 VAPID 키 한 쌍을 만들어 보여줍니다. 환경변수를 설정한 뒤에는 막힙니다.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.VAPID_PUBLIC_KEY) return res.status(403).json({ error: '이미 VAPID 키가 설정되어 있습니다.' });
  const k = require('web-push').generateVAPIDKeys();
  res.status(200).json({ VAPID_PUBLIC_KEY: k.publicKey, VAPID_PRIVATE_KEY: k.privateKey, 안내: 'Vercel 환경변수에 두 값을 그대로 넣고 재배포하세요. 비공개 키는 다른 곳에 공유하지 마세요.' });
};
