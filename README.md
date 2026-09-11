# KBO LIVE - Vercel

KBO LIVE 실시간 경기/순위 페이지입니다. 브라우저 CORS 문제를 피하기 위해 Vercel Serverless Function이 Naver Sports KBO API를 중계합니다.

## GitHub + Vercel 배포

1. ZIP 압축을 풉니다.
2. 다음을 GitHub 저장소 **루트**에 올립니다.
   - `index.html`
   - `api/kbo.js`
   - `vercel.json`
   - `README.md`
3. Vercel → **Add New → Project → Import Git Repository**에서 저장소를 선택합니다.
4. Framework Preset은 **Other**로 둡니다.
5. Build Command와 Output Directory는 비워 둡니다.
6. **Deploy**를 누릅니다.

중요: `index.html`만 올리면 실시간 데이터가 작동하지 않습니다. `api/kbo.js`와 `vercel.json`도 함께 배포해야 합니다.
