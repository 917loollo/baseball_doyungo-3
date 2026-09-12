# KBO LIVE Vercel v4

스크린샷과 같은 형태의 KBO LIVE 대시보드입니다.

- 상단 KBO LIVE 헤더/네비게이션
- 날짜 선택 바
- 오늘 경기 6개 카드형 가로 배치
- 경기 카드 클릭 → 아래 상세 경기센터
- 이닝별 스코어 R/H/E/B
- 현재 타석, 베이스, 라인업, 투수, 실시간 중계
- 전체 경기 / 월별 일정
- 2026 순위
- Vercel Serverless API 프록시로 Naver Sports API CORS 문제 우회

## Vercel 배포

GitHub 저장소 루트에 `index.html`, `vercel.json`, `api/kbo.js`를 올린 뒤 Vercel에서 해당 저장소를 Import하세요.
Framework Preset은 `Other`, Build Command와 Output Directory는 비워두면 됩니다.

중요: `index.html`만 올리면 실시간 데이터가 작동하지 않습니다. 반드시 `api/kbo.js`도 함께 배포해야 합니다.
