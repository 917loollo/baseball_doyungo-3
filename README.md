# KBO LIVE - Vercel v3

## 기능
- 오늘 경기
- 전체 경기: 2026 시즌 3~10월 월별 조회
- 경기 상세
- 이닝별 스코어
- R/H/E/B
- 현재 타석/주자/볼·스트라이크·아웃
- 라인업/투수/실시간 중계
- KBO 순위
- 오늘 경기 5초 자동 갱신

## Vercel 배포
1. 이 폴더의 파일을 GitHub 저장소 루트에 업로드합니다.
2. Vercel에서 Add New → Project를 선택합니다.
3. GitHub 저장소를 Import합니다.
4. Framework Preset은 Other로 두고 Build Command/Output Directory는 비워둡니다.
5. Deploy를 누릅니다.

중요: index.html만 올리면 실시간 데이터가 동작하지 않습니다. `api/kbo.js`도 반드시 함께 배포해야 합니다.
