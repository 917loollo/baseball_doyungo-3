// 푸시 알림 공용 코드: Upstash/Vercel KV(REST) + web-push(VAPID)
const crypto = require('crypto');
const URL_ = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
async function R(...cmd) {
  if (!URL_() || !TOK()) throw new Error('Redis 환경변수(UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)가 없습니다.');
  const r = await fetch(URL_(), { method: 'POST', headers: { Authorization: 'Bearer ' + TOK(), 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
function vapid() {
  const webpush = require('web-push'); const pub = process.env.VAPID_PUBLIC_KEY, pri = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !pri) throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 환경변수가 없습니다.');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@example.com', pub, pri); return webpush;
}
const hash = e => crypto.createHash('sha256').update(e).digest('hex').slice(0, 32);
module.exports = { R, vapid, hash, hasRedis: () => !!(URL_() && TOK()) };
