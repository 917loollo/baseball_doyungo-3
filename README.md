# KBO LIVE Vercel v7

Vercel용 KBO LIVE. 네이버 스포츠 API는 `api/kbo.js` 서버리스 프록시를 통해 호출합니다.

## 배포
1. 이 폴더의 파일 전체를 GitHub 저장소 루트에 업로드합니다.
2. Vercel에서 해당 저장소를 Import 합니다.
3. Framework Preset은 Other, Build Command와 Output Directory는 비워 둡니다.
4. Deploy 합니다.

## v7 변경
- 휴대폰에서 전체 페이지 가로 넘침 방지
- 상단 메뉴/날짜/오늘 경기 카드만 가로 스크롤
- 경기 상세는 모바일 1열로 배치
- 이닝 표는 카드 내부에서만 가로 스크롤
- 현재 타자/투수, 주자, R/H/E/B, 투수, 실시간 중계가 모바일에서도 표시
- 380px 이하 화면에서 라인업/투수 카드도 1열로 전환
- 기존 5초 백그라운드 갱신 방식 유지
