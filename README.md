# KBO LIVE Vercel v5

5초 자동 갱신 시 화면을 비우지 않고 기존 화면을 그대로 유지한 상태에서 새 데이터를 받아 교체합니다.

## Vercel 배포
1. GitHub 저장소에 `index.html`, `api/kbo.js`, `vercel.json`을 루트 기준으로 업로드합니다.
2. Vercel에서 해당 GitHub 저장소를 Import합니다.
3. Framework Preset은 `Other`로 두고 Build Command / Output Directory는 비워 둡니다.
4. Deploy합니다.

`api/kbo.js`는 브라우저의 CORS 문제를 피하기 위한 KBO API 중계 서버리스 함수입니다.
