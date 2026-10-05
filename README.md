# KBO LIVE v11

Vercel용 KBO 경기센터입니다.

## v11 수정
- Naver relay API의 `result.textRelayData` 래퍼를 정상 해제해 **실시간 중계, 현재 타석, 주자, 라인업, 투수**가 표시되도록 수정
- `homeLineup/awayLineup` 및 `homeEntry/awayEntry`의 batter/pitcher 배열을 직접 처리
- 팀 로고를 **원형 프레임에 꽉 맞는 형태**로 표시
- 네이버 팀 로고 실패 시 다음 스포츠 로고로 fallback
- 기존 5초 백그라운드 갱신 방식 유지
- 모바일 레이아웃 유지

## 배포
GitHub 저장소 루트에 `index.html`, `api/`, `vercel.json`을 함께 올린 뒤 Vercel에서 Import/Deploy하세요.
