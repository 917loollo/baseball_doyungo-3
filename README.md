# KBO-LIVE Vercel v12

- 선수 얼굴/프로필 사진 제거
- 현재 타석의 1·2·3루/홈을 실제 야구장 형태에 가깝게 개선
- 현재 수비팀의 9개 수비 위치를 그라운드에 표시
- 기존 네이버 스포츠 relay 래퍼(result.textRelayData) 처리 유지
- 5초 자동 새로고침 시 기존 화면 유지
- v13: 깨진 필드 화면을 투구 존 + 스코어 오버레이(Daum 스포츠 스타일)로 교체, 현재 타자·투수를 currentGameState 기준으로 재계산
- v14: Daum 게임센터(sports2i) 스코어보드 연동(api/daum.js) — 타자·투수·볼카운트·점수·마지막 투구를 Daum 값 우선 사용, 실패 시 네이버 값으로 자동 대체
- v15: 선수 이름 옆 빈 원(사진 자리) 제거
- v16: 투구 존 가운데 정렬 수정
- v17: Daum graphic-Live 연동 — 투구 위치(번호 원)를 Daum 좌표로 표시, 색상 Daum 규칙(볼 초록·타격 파랑·그 외 주황)
- v18: 베이스 위 선수 이름을 베이스 옆에 크게 표시
- v19: 실시간 중계에 득점·1회~9회 이닝 탭 추가 (relay?inning=N 호출)

Vercel에 기존 프로젝트 파일을 교체해 배포하세요.


## D.V. AI setup
The KBO AI screen uses `/api/ai` so the Groq API key is never exposed in browser JavaScript.
Before deploying to Vercel, add an environment variable named `GROQ_API_KEY` containing your own server-side key.
Do not put the key in `index.html`. The key included in any previous public HTML should be revoked/rotated.

AI features: current-game context, MY-team context, game-flow analysis, summary, viewing points, team comparison, and baseball-term explanations.

- v20: 초기화·자동 새로고침(3/5/10/30초·끔) 복구, 다크 모드, 팀 필터, MY팀·즐겨찾기 경기 알림(득점/시작/종료), 경기 인사이트(승리 확률·상대전적·최근 흐름·공유), 순위 상세 기록(승차·최근5·연속·득실·피타고리안·홈/원정), MY 팀 대시보드, D.V. AI 실제 경기·순위 컨텍스트 + 대화 기억 + 추천 질문
- v21: D.V. AI 채팅 — 실시간 스트리밍, ChatGPT식 마크다운(제목·목록·표·코드블록 복사·인용·링크), 중지/다시 생성/답변 복사. 키는 반드시 Vercel 환경변수 GROQ_API_KEY 로만 설정
- v22: LaTeX 수식($..$, $$..$$, \(..\), \[..\]) KaTeX 렌더링. api/ai.js 에 키 폴백 포함 — 저장소를 공개하지 마세요
- v23: 외부 사이트(ai.doyungo.com)로 이동하던 링크 제거, 앱 내 D.V. AI 채팅만 사용
- v24: no-cache 헤더 추가(이전 버전 캐시로 인한 외부 이동 방지)
- v25: /api/ai 가 없는 호스팅에서도 브라우저에서 Groq 직접 호출(키가 페이지에 노출되므로 공개 배포 시 주의)
- v26: 스트라이크존 모서리 둥글게 + 실제 비율(폭 17인치 기준, 높이는 타자 신장별 존 높이)
