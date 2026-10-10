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
- v27: 첫 화면 즉시 표시(마지막 일정·상세 캐시), 시즌 조회/KaTeX 지연 로딩, API 엣지 캐시, 스코어카드 팀 컬러 그라데이션
- v28: 라인업 빠른 조회(preview/relay 병렬, 상세 로딩과 분리) + 다음스포츠 요청 2.5초 타임아웃
- v29: 선수 얼굴 사진 표시(라인업·선발·현재 투수/타자·투수 기록), 사진 없으면 기본 실루엣, 이미지 API 캐시
- v30: /api/kbo JSON 검증·재시도·최근 응답 대체, 오류 메시지에 HTTP 상태 표시, 지난 달 일정 저장본 사용
- v31: AI 전송 시 ensureSeason is not defined 오류 수정
- v32: 화면 갱신을 DOM 병합 방식으로 변경 — 로고·선수 사진이 꺼졌다 켜지는 깜빡임 제거
- v33: /api 미배포(404) 시 원인 안내 문구
- v34: 화면 문구 DOYUNGO 로 통일, /api/kbo·/api/doyungo 모두 지원(자동 전환), diag.html 포함
- v35: 이닝/상태 알약 글자색 복구, 선수 사진 다중 출처(네이버·KBO) 병렬 조회
- v36: 홈 화면 앱(PWA) 지원, 사진 없을 때 이름 첫 글자 아바타, 점수 변화 강조·진동, 갱신 시각·새로고침 버튼
- v37: UI 전면 개편(유리 질감·모바일 하단 탭바·새 타이포), 이닝 표기 1회초 수정, 경기 전에는 "경기 예정"만 표시
- v38: 코드에 넣어 둔 AI 키 제거(키는 Vercel 환경변수 GROQ_API_KEY 로만), Invalid API Key 안내 문구
- v39: 라인업 필드 대소문자 무시·별칭 확대, 빠른 라인업 파서 완화·안내 문구, diag 라인업 구조 점검
