# 디자인 규칙 — AX마스터 학사 챗봇

> 레퍼런스: 라벤더·핑크 파스텔 배경, 빛나는 구(orb), 반투명 유리 카드, 둥근 알약형(pill) 버튼, 큰 세리프 인사말.
> 방향: **밝은 글래스모피즘** · **모바일 우선** · **한국어 가독성 우선**.

---

## 0. 원칙 5가지

1. **유리는 배경 위에서만 산다.** 유리 카드 뒤에는 항상 그라데이션 배경이나 빛 번짐(blob)이 있어야 한다. 흰 바탕 위 유리 효과는 쓰지 않는다.
2. **강조는 한 화면에 하나.** 진한 마젠타 그라데이션(Primary)은 화면당 주요 행동 1개에만 쓴다.
3. **글자는 유리 위에서도 읽혀야 한다.** 본문 대비 4.5:1 이상. 장식 때문에 대비를 낮추지 않는다.
4. **모든 간격은 4px 배수.** 아래 간격 토큰 외의 값은 쓰지 않는다.
5. **한국어는 단어 단위로 줄바꿈.** 모든 페이지에 `word-break: keep-all`.
6. **그리드에 맞추고, 같은 줄은 같은 높이.** 박스 폭은 그리드 칸으로만 정하고, 같은 줄에는 내용 양이 비슷한 박스끼리 둔다. 빈 공간을 줄바꿈으로 채우지 않는다 (6장).

---

## 1. 색상

레퍼런스 이미지에서 뽑은 색이다. 레퍼런스의 밝은 핑크 버튼은 흰 글자 대비가 부족해서, 버튼 바탕은 한 단계 진하게 두고 밝은 핑크는 **빛(glow)·후광**에 쓴다.

### 1-1. 배경

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg-base` | `#F7F2FB` | 페이지 기본 바탕 (연한 라벤더) |
| `--bg-blush` | `#FBEFF6` | 그라데이션 핑크 쪽 |
| `--bg-lilac` | `#EEE6FA` | 그라데이션 라일락 쪽 |
| `--bg-gradient` | `linear-gradient(160deg, #FBEFF6 0%, #F7F2FB 45%, #EEE6FA 100%)` | 페이지 전체 배경 |

### 1-2. 빛 번짐(blob)·구(orb)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--glow-pink` | `#F5B8DA` | 구·배경 번짐 |
| `--glow-magenta` | `#E77FCF` | 구 중심, 버튼 후광 |
| `--glow-lilac` | `#C9B6F2` | 구·배경 번짐 |
| `--glow-sky` | `#B9C9F5` | 구 가장자리 (푸른 기) |
| `--glow-peach` | `#FAD3C4` | 구 하이라이트 |

### 1-3. 브랜드(강조)

| 토큰 | 값 | 흰 글자 대비 | 용도 |
|---|---|---|---|
| `--brand-600` | `#A12E92` | 약 6.6:1 | Primary 버튼 시작색, 링크 |
| `--brand-500` | `#C43BA8` | 약 4.6:1 | Primary 버튼 끝색 |
| `--brand-300` | `#E77FCF` | — (글자 X) | 후광, 아이콘 배경 |
| `--brand-100` | `#FBE3F3` | — | 선택된 칩·태그 바탕 |
| `--brand-gradient` | `linear-gradient(135deg, #A12E92 0%, #C43BA8 100%)` | | Primary 버튼 |
| `--accent-lavender` | `#7B6BB0` | | 큰 제목 강조어 ("안녕하세요" 같은 인사말), 24px 이상만 |

### 1-4. 글자

| 토큰 | 값 | 용도 |
|---|---|---|
| `--text-strong` | `#231C36` | 제목 |
| `--text-body` | `#3A3350` | 본문 |
| `--text-sub` | `#5E5675` | 보조 설명 |
| `--text-muted` | `#736B8A` | 캡션, 시간 표시 (13px 이상) |
| `--text-on-brand` | `#FFFFFF` | Primary 버튼 글자 |
| `--text-placeholder` | `#8F88A3` | 입력창 안내 문구 |

### 1-5. 상태

| 토큰 | 글자/선 | 바탕 | 용도 |
|---|---|---|---|
| success | `#1F7A55` | `#E3F5EC` | 접수 완료 |
| warning | `#8A5A00` | `#FFF3D6` | 개인정보 입력 주의 안내 |
| danger | `#B4233C` | `#FDE6EA` | 오류, 입력 검증 실패 |
| info | `#3F55A8` | `#E6ECFB` | 근거 조항 배지 (제N조) |

### 1-6. 유리(Glass)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.55)` | 기본 카드 |
| `--glass-bg-strong` | `rgba(255,255,255,0.75)` | 입력창, 모달, 긴 글이 올라가는 카드 |
| `--glass-bg-subtle` | `rgba(255,255,255,0.35)` | 칩, 보조 버튼 |
| `--glass-border` | `rgba(255,255,255,0.7)` | 유리 테두리 (윗면 빛) |
| `--glass-border-soft` | `rgba(164,140,200,0.18)` | 유리 테두리 (아랫면 그림자 쪽) |
| `--glass-blur` | `20px` | 기본 블러 |
| `--glass-blur-strong` | `32px` | 모달·하단 입력바 |

---

## 2. 글꼴

| 역할 | 글꼴 | 이유 |
|---|---|---|
| 본문·UI (한글/영문) | **Pretendard Variable** | 한글·영문 폭이 고르고 모바일에서 선명 |
| 인사말·큰 제목 (한글) | **Gowun Batang** (700) | 레퍼런스의 세리프 인사말 느낌을 한글로 |
| 큰 제목 영문·숫자 강조 | **Instrument Serif** | 레퍼런스 "Hello Rehan"과 같은 결 |
| 숫자 (환불액·조항 번호) | Pretendard + `font-variant-numeric: tabular-nums` | 자릿수 정렬 |

```html
<!-- Pretendard -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<!-- Gowun Batang, Instrument Serif -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Instrument+Serif&display=swap" />
```

Next.js에서는 `next/font/google`(Gowun Batang, Instrument Serif)과 `next/font/local`(Pretendard)로 불러온다.

### 2-1. 글자 크기 단계 (모바일 기준)

| 토큰 | 크기 / 줄 높이 | 굵기 | 글꼴 | 용도 |
|---|---|---|---|---|
| `--fs-display` | 34px / 44px | 700 | 세리프 | 첫 화면 인사말 |
| `--fs-h1` | 26px / 36px | 700 | 세리프 | 페이지 제목 |
| `--fs-h2` | 20px / 28px | 700 | Pretendard | 섹션 제목, 모달 제목 |
| `--fs-h3` | 17px / 24px | 600 | Pretendard | 카드 제목 |
| `--fs-body` | 16px / 28px | 400 | Pretendard | 본문, 챗봇 답변 |
| `--fs-body-sm` | 15px / 24px | 400 | Pretendard | 말풍선 보조, 칩 |
| `--fs-caption` | 13px / 20px | 500 | Pretendard | 시간, 근거 조항 배지, 도움말 |
| `--fs-button` | 15px / 20px | 600 | Pretendard | 버튼 |

- 태블릿(≥ 768px): display 40/52px, h1 28/36px.
- 데스크톱(≥ 1024px): display 44/56px, h1 32/40px, h2 22/32px. 나머지는 그대로.
- 줄 높이는 모두 4px 배수다 (6-10 수직 리듬).
- 입력창 글자는 **16px 아래로 내리지 않는다** (iOS 자동 확대 방지).
- 자간: 제목 `-0.02em`, 본문 `-0.01em`, 캡션 `0`.

---

## 3. 간격·여백 (4px 그리드)

### 3-1. 간격 토큰

| 토큰 | 값 | 대표 용도 |
|---|---|---|
| `--space-0` | 0 | — |
| `--space-1` | 4px | 아이콘과 글자 사이(작은), 배지 안쪽 세로 |
| `--space-2` | 8px | 칩 사이, 아이콘–글자 사이, 같은 사람의 연속 말풍선 사이 |
| `--space-3` | 12px | 버튼 안쪽 세로(md), 카드 안 요소 사이 |
| `--space-4` | 16px | **화면 좌우 여백(모바일)**, 카드 안쪽 여백, 다른 사람 말풍선 사이 |
| `--space-5` | 20px | 카드 안쪽 여백(큰 카드), 버튼 안쪽 가로 |
| `--space-6` | 24px | 섹션 안 블록 사이, 모달 안쪽 여백 |
| `--space-8` | 32px | 섹션 사이(모바일) |
| `--space-10` | 40px | 헤더–본문 사이, 화면 좌우 여백(데스크톱) |
| `--space-12` | 48px | 섹션 사이(데스크톱) |
| `--space-16` | 64px | 히어로 위아래 |

### 3-2. 컴포넌트 간격 규칙

| 대상 | 규칙 |
|---|---|
| 페이지 좌우 여백 | 모바일 16px, 태블릿 24px, 데스크톱 40px |
| 콘텐츠 최대 폭 | 채팅 영역 `720px`, 담당자 화면 `1120px` |
| 헤더 높이 | 56px (모바일), 64px (데스크톱). 위아래 안쪽 여백 8px |
| 헤더 → 첫 콘텐츠 | 24px (모바일), 40px (데스크톱) |
| 섹션 ↔ 섹션 | 32px (모바일), 48px (데스크톱) |
| 제목 → 그 아래 본문 | 8px (h2·h3), 12px (h1·display) |
| 카드 안쪽 여백 | `--card-pad` = 16px (mobile) / 20px (tablet) / 24px (desktop). 작은 카드는 12px |
| 카드 ↔ 카드 | 세로 목록 12px, 그리드 배치는 거터 `--gutter` = 16px / 24px / 24px |
| 폼 필드 ↔ 필드 | 16px |
| 라벨 → 입력창 | 8px |
| 입력창 → 도움말/오류 | 8px |
| 버튼 ↔ 버튼 (나란히) | 8px |
| 버튼 그룹 → 위 콘텐츠 | 24px |
| 칩 ↔ 칩 | 8px (가로·세로 모두) |
| 말풍선 ↔ 말풍선 | 같은 사람 연속 8px, 화자 바뀔 때 16px |
| 말풍선 → 근거 배지 | 8px |
| 채팅 목록 하단 | 하단 입력바 높이 + 16px 만큼 비워 둔다 |
| 하단 입력바 | 화면 아래에서 `max(12px, env(safe-area-inset-bottom))` |

### 3-3. 모서리 둥글기

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-xs` | 6px | 배지 |
| `--radius-sm` | 12px | 작은 카드, 입력창(여러 줄) |
| `--radius-md` | 16px | 칩, 기본 카드 |
| `--radius-lg` | 24px | 큰 카드, 모달, 말풍선 |
| `--radius-xl` | 32px | 휴대폰 화면 같은 큰 패널 |
| `--radius-pill` | 999px | 버튼, 하단 입력바, 검색창 |

### 3-4. 그림자

유리는 진한 그림자를 쓰지 않는다. 보라빛이 도는 넓고 연한 그림자만 쓴다.

| 토큰 | 값 |
|---|---|
| `--shadow-sm` | `0 2px 8px rgba(120, 90, 170, 0.08)` |
| `--shadow-md` | `0 8px 24px rgba(120, 90, 170, 0.12)` |
| `--shadow-lg` | `0 20px 48px rgba(120, 90, 170, 0.16)` |
| `--shadow-glow` | `0 8px 24px rgba(196, 59, 168, 0.35)` (Primary 버튼 후광) |
| `--glass-inset` | `inset 0 1px 0 rgba(255,255,255,0.8)` (유리 윗면 빛) |

---

## 4. 버튼

### 4-1. 공통 규칙

- 모양: 모두 **알약형** (`border-radius: 999px`). 아이콘 전용 버튼은 원형.
- 최소 터치 영역: **44 × 44px** (보이는 크기가 작아도 터치 영역은 44px 확보).
- 글자: 15px, 600, 한 줄. 버튼 글자는 동사로 끝낸다 ("접수하기", "보내기").
- 아이콘 + 글자: 아이콘 18px, 사이 8px.
- 한 화면에 Primary는 1개.
- 로딩 중: 글자 자리에 점 3개 애니메이션, 폭 유지, `aria-busy="true"`, 클릭 막기.
- 비활성: 투명도 0.45, 그림자 없음, `cursor: not-allowed`. 비활성 이유는 버튼 근처에 글로 알려 준다.
- 포커스: `outline: 3px solid rgba(196,59,168,0.45); outline-offset: 2px` (키보드일 때만, `:focus-visible`).

### 4-2. 크기

| 크기 | 높이 | 안쪽 가로 | 글자 | 용도 |
|---|---|---|---|---|
| `sm` | 36px (터치 44px 확보) | 14px | 14px | 헤더 안 버튼, 표 안 동작 |
| `md` (기본) | 44px | 20px | 15px | 대부분 |
| `lg` | 52px | 28px | 16px | 첫 화면 시작 버튼, 모달 확정 버튼 |
| 아이콘 `sm` / `md` / `lg` | 36 / 44 / 52px 원형 | — | 아이콘 18 / 20 / 22px | 닫기, 보내기, 메뉴 |

### 4-3. 종류

| 종류 | 바탕 | 글자 | 테두리 | 그림자 | 쓰는 곳 |
|---|---|---|---|---|---|
| **Primary** | `--brand-gradient` | 흰색 | 없음 | `--shadow-glow` | 접수하기, 질문 시작 |
| **Secondary (유리)** | `--glass-bg-strong` + 블러 | `--text-strong` | `--glass-border` | `--shadow-sm` + inset | 로그인, 취소, 보조 동작 |
| **Ghost** | 투명 | `--brand-600` | 없음 | 없음 | 더보기, 링크형 동작 |
| **Soft** | `--brand-100` | `--brand-600` | 없음 | 없음 | "담당자에게 연결" 같은 중간 강조 |
| **Danger** | `#B4233C` | 흰색 | 없음 | 없음 | 담당자 화면의 삭제 (확인 창 필수) |
| **Icon (유리)** | `--glass-bg` + 블러 | `--text-body` | `--glass-border` | `--shadow-sm` | 닫기, 메뉴 |
| **Send** | `--brand-gradient` 원형 | 흰색 아이콘 | 없음 | `--shadow-glow` | 입력바 보내기 |

### 4-4. 상태 변화

| 상태 | Primary | Secondary / Icon | Ghost / Soft |
|---|---|---|---|
| hover (마우스) | 밝기 1.06, 후광 진하게 | 바탕 `rgba(255,255,255,0.9)` | 바탕 `--brand-100` |
| active (누름) | `scale(0.97)`, 밝기 0.96 | `scale(0.97)` | `scale(0.97)` |
| focus-visible | 포커스 링 | 포커스 링 | 포커스 링 |
| disabled | 투명도 0.45 | 투명도 0.45 | 투명도 0.45 |

전환 시간: `160ms`, `cubic-bezier(0.2, 0.8, 0.2, 1)`.

---

## 5. 컴포넌트

### 5-1. 배경과 빛 번짐

- `body`: `--bg-gradient`.
- 화면 고정 레이어에 큰 원형 번짐 2–3개 (`filter: blur(60px)`, 투명도 0.5–0.7). 위치: 왼쪽 위 핑크, 오른쪽 가운데 라일락, 아래 하늘색.
- 번짐은 `pointer-events: none`, `z-index: -1`.

### 5-2. 구(Orb) — 챗봇의 얼굴

- 첫 화면 가운데, 답변 생성 중 표시, 빈 상태에 쓴다.
- 크기: 첫 화면 160px (모바일) / 220px (데스크톱), 생성 중 표시 32px.
- 구성: 방사형 그라데이션(핑크·라일락·하늘) + 바깥 후광 2겹(연한 흰 링) + 느린 회전/숨쉬기 애니메이션(6–8초).
- `prefers-reduced-motion`이면 애니메이션 끔.

### 5-3. 헤더

- 높이 56px, 좌우 16px, 유리(`--glass-bg`, 블러 20px), 아래 테두리 `--glass-border-soft`.
- 왼쪽: 로고/과정명. 오른쪽: 아이콘 버튼 또는 sm 버튼.
- 스크롤 시 상단 고정(`position: sticky`).

### 5-4. 유리 카드

- 바탕 `--glass-bg`, 블러 20px, 테두리 1px `--glass-border`, 둥글기 24px, 안쪽 16–20px, 그림자 `--shadow-md` + `--glass-inset`.
- 글이 길면 `--glass-bg-strong`으로 바꾼다.

### 5-5. 추천 질문 칩

레퍼런스 "Read me a book / Personal therapy" 칩.

- 높이 최소 44px, 안쪽 8px 14px (8 + 아이콘 28 + 8 = 44), 둥글기 16px, 바탕 `--glass-bg-subtle`, 테두리 `--glass-border`.
- 왼쪽 아이콘 상자 28px (바탕 `--brand-100`, 둥글기 8px) + 글자 15px.
- 가로 스크롤 목록: 칩 사이 8px, 좌우 끝 16px 여백, 스크롤바 숨김, `scroll-snap`.
- 선택됨: 바탕 `--brand-100`, 테두리 `--brand-300`.

### 5-6. 말풍선

| | 학생(나) | 챗봇 |
|---|---|---|
| 정렬 | 오른쪽 | 왼쪽 |
| 바탕 | `--brand-gradient` | `--glass-bg-strong` + 블러 |
| 글자 | 흰색 | `--text-body` |
| 최대 폭 | 82% | 88% |
| 둥글기 | 24px, 오른쪽 아래만 8px | 24px, 왼쪽 위만 8px |
| 안쪽 여백 | 12px 16px | 14px 16px |

- 챗봇 답변 아래에 **근거 배지**: `제7조` 형태, info 색, 13px, 둥글기 6px, 안쪽 4px 8px, 배지 사이 8px.
- 담당자 접수로 넘어가는 답변에는 Soft 버튼 "담당자에게 접수하기"를 말풍선 아래 8px에 둔다.
- 시간 표시: 13px `--text-muted`, 말풍선 아래 4px.

### 5-7. 하단 입력바

레퍼런스 "Tap on AI to start speaking..." / "Write down instead..." 바.

- 화면 아래 고정, 좌우 16px, 아래 `max(12px, safe-area)`.
- 높이 최소 56px, 둥글기 999px, 바탕 `--glass-bg-strong`, 블러 32px, 테두리 `--glass-border`, 그림자 `--shadow-lg`.
- 안쪽: 왼쪽 16px, 오른쪽 6px (보내기 버튼 44px가 안에 붙음).
- 입력창 16px, 여러 줄이면 최대 4줄까지 늘어나고 둥글기는 24px로 바뀐다.
- 글자 수 상한(보안 규칙) 근처면 오른쪽에 `120/500` 캡션 표시, 넘으면 danger 색.
- 입력바 위 8px에 개인정보 주의 문구(13px, `--text-muted`): "성적 등 개인정보는 입력하지 마세요."
- 입력바 영역 뒤에는 아래에서 위로 옅어지는 배경 그라데이션을 깔아, 스크롤된 말풍선과 주의 문구가 겹쳐 보이지 않게 한다.

### 5-8. 입력 필드 (접수 폼)

- 라벨 14px 600 `--text-strong`, 필수 표시는 "(필수)" 글자로 (색만으로 표시 X).
- 입력창: 높이 48px, 안쪽 0 16px, 둥글기 12px, 바탕 `rgba(255,255,255,0.8)`, 테두리 1px `rgba(164,140,200,0.35)`, 글자 16px.
- 포커스: 테두리 `--brand-500`, 바깥 링 `0 0 0 4px rgba(196,59,168,0.15)`.
- 오류: 테두리 danger, 아래 8px에 오류 문구 13px (아이콘 + 글자).
- 받는 항목은 기수·이름·연락처·내용 4개만.

### 5-9. 모달 / 바텀시트

- 모바일: 바텀시트 (위 둥글기 32px, 손잡이 막대 36×4px, 위 8px).
- 데스크톱: 가운데 모달, 최대 폭 480px, 둥글기 24px.
- 바탕 `--glass-bg-strong`, 블러 32px, 안쪽 24px, 뒤 덮개 `rgba(35,28,54,0.25)` + 블러 4px.
- 제목 h2, 제목→본문 8px, 본문→버튼 24px, 버튼은 모바일에서 세로로 꽉 차게(Primary 위).

### 5-10. 알림(토스트)

- 화면 위 가운데, 위 16px, 최대 폭 `calc(100% - 32px)`.
- 유리 + 상태색 왼쪽 아이콘, 안쪽 12px 16px, 둥글기 16px, 4초 후 사라짐, `role="status"`.

### 5-11. 담당자 화면 (접수 목록)

- 같은 토큰을 쓰되 유리 강도는 낮춘다 (`--glass-bg-strong`만 사용, 번짐 1개).
- 표: 행 높이 52px, 셀 안쪽 12px 16px, 행 구분선 `rgba(164,140,200,0.18)`, 머리글 13px 600 `--text-sub`.
- 모바일에서는 표 대신 카드 목록 (카드 사이 12px).
- 상태 배지: 접수(info) / 처리 중(warning) / 완료(success).

---

## 6. 레이아웃 · 그리드 · 반응형

목표는 **보기에 안정된 배치**다. 박스의 가장자리가 같은 선에 맞고, 같은 줄의 박스 높이가 같고, 박스 안에 빈 공간이 어색하게 몰리지 않아야 한다. 웹(데스크톱)과 휴대폰 모두에 적용한다.

### 6-0. 용어

| 용어 | 뜻 |
|---|---|
| 여백 (화이트 스페이스, negative space) | 아무것도 없는 빈 공간 전체 |
| 패딩 (padding) | 박스 **안쪽** 여백. 테두리에서 내용까지 |
| 마진 (margin) | 박스 **바깥** 여백. 박스와 주변 사이 |
| 간격 (gap, spacing) | 나란히 놓인 요소들 사이의 거리 |
| 거터 (gutter) | 그리드 칸과 칸 사이 간격 |
| 근접성 원리 (Law of Proximity) | 가까이 있는 것끼리 한 묶음으로 보인다는 원리. 여백 위계(6-6)의 근거 |
| 정렬 (alignment) | 요소의 가장자리나 글자 기준선을 같은 선에 맞추는 것 |
| 수직 리듬 (vertical rhythm) | 위아래 간격이 일정한 배수로 반복되어 생기는 안정감 |
| 시각적 균형 (visual balance) | 화면의 좌우·위아래 무게가 고르게 느껴지는 상태 |
| 간격 체계 (spacing system, 4pt/8pt 그리드) | 모든 간격을 정해진 배수로만 쓰는 규칙. 이 문서는 4px 배수 |

### 6-1. 화면 크기 구간 (브레이크포인트)

| 구간 | 화면 폭 | 그리드 칸 수 | 바깥 여백 | 거터 | 콘텐츠 최대 폭 |
|---|---|---|---|---|---|
| mobile | 320–767px | 4 | 16px | 16px | 화면 폭 |
| tablet | 768–1023px | 8 | 24px | 24px | 화면 폭 |
| desktop | 1024–1279px | 12 | 40px | 24px | 1120px |
| wide | 1280px 이상 | 12 | 남는 폭을 좌우에 똑같이 | 24px | 1120px (전시용 1280px) |

- 기준 화면: 휴대폰 **375px**, 데스크톱 **1280px**. 가장 좁게는 **320px**에서도 깨지지 않아야 한다.
- 화면 크기는 `100dvh`로 잡는다 (모바일 주소창이 나타났다 사라져도 화면이 튀지 않게).
- 가로 스크롤은 금지한다. 칩 목록처럼 일부러 만든 가로 스크롤 영역만 예외다.

### 6-2. 콘텐츠 폭 3가지

| 이름 | 최대 폭 | 쓰는 곳 |
|---|---|---|
| narrow | 720px | 채팅, 긴 글, 접수 폼 |
| default | 1120px | 담당자 화면, 일반 페이지 |
| wide | 1280px | 디자인 견본, 전시 페이지 |

한 페이지 안에서는 폭을 하나만 쓴다. 섹션마다 폭이 들쭉날쭉하면 왼쪽 끝선이 어긋나 보인다.

### 6-3. 칸 나누기 (span)

박스 폭은 **그리드 칸 수**로만 정한다. `width: 340px` 같은 임의 폭은 쓰지 않는다.

| 배치 | desktop (12칸) | tablet (8칸) | mobile (4칸) |
|---|---|---|---|
| 1단 | 12 | 8 | 4 |
| 2등분 | 6 + 6 | 4 + 4 | 4 (세로로 쌓기) |
| 3등분 | 4 + 4 + 4 | 4 + 4, 남은 1개는 8 | 4 (세로로 쌓기) |
| 4등분 | 3 × 4 | 4 + 4 (2줄) | 4 (세로로 쌓기) |
| 주 + 보조 | 8 + 4 | 8 (세로로 쌓기) | 4 (세로로 쌓기) |
| 작은 견본·숫자 카드 | 2 × 6 | 2 × 4 | 2 × 2 |

- **외톨이 금지**: 마지막 줄에 박스가 1개만 남으면 그 박스를 줄 전체 폭으로 늘리거나, 박스 개수를 칸 수에 맞게 조정한다. (폰 목업처럼 폭이 고정된 요소만 가운데 정렬을 허용한다.)
- 모든 박스의 왼쪽·오른쪽 끝은 그리드 칸의 경계선에 놓인다.
- 휴대폰에서 글이 들어간 카드는 1열이 기본이다. 2열은 숫자·아이콘·색 견본처럼 짧은 카드에만 쓴다.

### 6-4. 같은 줄 박스의 높이 맞추기 (가장 중요)

**규칙 1. 같은 줄에 놓인 박스는 높이가 같다.** 그리드가 자동으로 맞춘다. 높이를 숫자로 따로 맞추지 않는다.

**규칙 2. 높이는 내용이 정한다.** 글이 들어가는 박스에는 고정 `height`를 쓰지 않는다. `min-height`는 버튼, 입력창, 아이콘 버튼 같은 조작 요소에만 쓴다.

**규칙 3. 같은 줄에는 내용 양이 비슷한 박스끼리 놓는다.**
짧은 박스의 내용 높이가 가장 긴 박스의 **70%보다 작으면** 배치를 바꾼다. 아래 순서로 고려한다.
1. 짧은 박스에 꼭 필요한 내용(설명, 예시)이 빠졌는지 본다. 채우려고 내용을 지어내지는 않는다.
2. 짧은 박스 2개를 세로로 쌓아서 긴 박스 1개 옆에 둔다 (2:1 쌓기).
3. 칸 비율을 바꾼다 (긴 쪽 8칸, 짧은 쪽 4칸).
4. 짧은 박스를 줄 전체 폭으로 따로 뺀다.

**규칙 4. 남는 공간이 박스 아래에 몰리지 않게 한다.** 카드는 세 부분으로 나눈다.

```
┌──────────────┐   ┌──────────────┐
│ 머리 (제목)   │   │ 머리 (제목)   │
│ 몸통 (내용)   │   │ 몸통 (내용)   │
│              │   │ 내용이 더 긺  │
│              │   │ 내용이 더 긺  │
│ 꼬리 (버튼)   │   │ 꼬리 (버튼)   │  ← 꼬리는 바닥에 붙어서 같은 선에 정렬
└──────────────┘   └──────────────┘
```

- 꼬리(버튼, 날짜, 링크)는 카드 바닥에 붙인다 (`margin-top: auto`). 남는 공간은 몸통과 꼬리 사이로 가고, 옆 카드의 버튼과 같은 높이에 정렬된다.
- 꼬리가 없는 짧은 카드(숫자, 아이콘, 한 줄 문구)는 내용을 **세로 가운데**에 둔다.
- 꼬리가 없는 긴 글 카드는 위에서부터 놓되, 규칙 3으로 높이 차이 자체를 줄인다.

**규칙 5. 박스 안의 남는 빈 공간은 32px까지만 허용한다** (패딩 제외). 그보다 크면 규칙 3을 적용한다.

**규칙 6. 휴대폰 1열에서는 높이를 맞추지 않는다.** 박스가 세로로 쌓이면 각자 내용만큼의 높이를 가진다.

```
✕ 나쁜 예                         ○ 좋은 예
┌────────┐ ┌────────┐            ┌────────┐ ┌────────┐
│ 제목    │ │ 제목    │            │ 제목    │ │ 제목    │
│ 두 줄   │ │ 여섯 줄 │            │ 네 줄   │ │ 다섯 줄 │
│        │ │ ...    │            │ ...    │ │ ...    │
│ (빈칸)  │ │ ...    │            │ 버튼    │ │ 버튼    │
│ (빈칸)  │ │ ...    │            └────────┘ └────────┘
└────────┘ └────────┘            양이 비슷한 박스끼리, 버튼은 바닥선에
```

### 6-5. 줄바꿈과 글 폭

- **빈 줄이나 `<br>`로 공간을 채우지 않는다.** 빈 공간 문제는 배치(6-4 규칙 3)로 해결한다.
- `<br>`은 제목을 뜻이 끊기는 곳에서 나눌 때만 쓴다 (예: "안녕하세요,<br>무엇이 궁금하세요?").
- 제목은 `text-wrap: balance`로 줄 길이를 고르게 한다. 본문은 `text-wrap: pretty`로 마지막 줄에 한두 글자만 남는 것을 막는다.
- 본문 한 줄은 **한글 35–40자**(`max-width: 36em`)를 넘기지 않는다. 넓은 화면에서 글을 끝까지 늘리지 않는다.
- 문단 사이 간격은 12px. 빈 줄을 두 번 이상 넣지 않는다.
- `word-break: keep-all`은 항상 켠다.

### 6-6. 여백 위계 (근접성 원리)

관계가 가까운 것은 가깝게, 먼 것은 멀게 둔다. 간격은 4단계만 쓴다.

| 단계 | 값 | 무엇과 무엇 사이 |
|---|---|---|
| 1. 붙음 | 4–8px | 아이콘–글자, 라벨–입력창(8px), 제목–부제, 말풍선–시간 |
| 2. 묶음 안 | 12–16px | 카드 안 요소, 폼 필드끼리, 목록 항목끼리 |
| 3. 묶음 사이 | 24–32px | 카드 묶음끼리, 섹션 안 블록끼리, 내용–버튼 그룹 |
| 4. 구역 사이 | 32–64px | 섹션–섹션, 헤더–본문 |

- **박스 안 요소 사이 간격 ≤ 박스 패딩.** 안쪽 요소끼리가 테두리보다 멀면 내용이 흩어져 보인다.
- **박스 사이 간격 ≥ 박스 안 요소 사이 간격.** 그래야 박스가 하나의 묶음으로 보인다.
- 단계가 하나 올라가면 간격은 **1.5배 이상** 커진다.
- 제목은 아래 내용 쪽에 붙인다. **제목 위 여백은 제목 아래 여백의 2배 이상.**
- 같은 단계의 간격은 한 화면 안에서 같은 값을 쓴다.
- 화면이 넓어질 때 1·2단계는 그대로 두고 3·4단계만 커진다 (6-9 표).

### 6-7. 정렬

- 한 구역 안에서 정렬 기준은 하나다. 기본은 왼쪽 정렬.
- 가운데 정렬은 히어로, 빈 화면 안내, 두 줄 이하의 짧은 글, 단독 버튼에만 쓴다.
- 카드 안 글은 카드 패딩 선에서 시작한다. 아이콘이 앞에 있으면 둘째 줄부터는 아이콘이 아니라 첫 글자 위치에 맞춘다.
- 숫자 열은 오른쪽 정렬하고 `tabular-nums`로 자릿수를 맞춘다.
- 나란히 놓인 버튼은 같은 크기를 쓴다.

### 6-8. 겹침 방지

- 배치는 `grid`와 `flex`로만 한다. `position: absolute`는 장식(배경 번짐, 구의 후광)과 미리 자리를 비워 둔 배지에만 쓴다.
- 음수 마진은 쓰지 않는다. 칩 목록을 화면 끝까지 늘릴 때만 예외.
- grid·flex 안의 자식에는 `min-width: 0`을 준다. 긴 글이나 URL이 박스를 밀어내지 않게 한다.
- 고정된 헤더·입력바가 있으면 본문에 그 높이만큼 자리를 비워 둔다.
- 겹치는 순서는 z-index 토큰만 쓴다: 헤더 20, 입력바 30, 모달 50, 토스트 60.
- 누를 수 있는 요소 사이는 최소 8px 띄운다.
- 이미지와 구는 `aspect-ratio`로 자리를 먼저 잡는다. 불러오는 동안 아래 내용이 밀리지 않게 한다.
- 글자를 200%로 키워도 겹치지 않아야 한다. 고정 높이를 금지하는 이유다.
- 확인하는 화면 폭: 320 · 375 · 768 · 1024 · 1280 · 1440px.

### 6-9. 반응형 세부

| 항목 | mobile (< 768) | tablet (768–1023) | desktop (≥ 1024) |
|---|---|---|---|
| 그리드 칸 | 4 | 8 | 12 |
| 바깥 여백 | 16px | 24px | 40px |
| 거터 (박스 사이) | 16px | 24px | 24px |
| 카드 패딩 | 16px | 20px | 24px |
| 섹션 사이 | 32px | 40px | 48px |
| 헤더 높이 | 56px | 56px | 64px |
| display / h1 / h2 | 34 / 26 / 20px | 40 / 28 / 20px | 44 / 32 / 22px |
| 본문 글자 | 16px | 16px | 16px |
| 채팅 영역 폭 | 화면 폭 | 720px 가운데 | 720px 가운데 |
| 글 카드 배열 | 1열 | 2열 | 2–3열 |
| 모달 | 아래에서 올라오는 바텀시트 | 가운데 모달 480px | 가운데 모달 480px |
| 폼 버튼 | 세로로 꽉 차게, 주 버튼 위 | 가로로, 오른쪽 정렬 | 가로로, 오른쪽 정렬 |
| 담당자 목록 | 카드 목록 | 표 | 표 |
| hover 효과 | 없음 | 마우스가 있을 때만 | 마우스가 있을 때만 |

- hover 효과는 `@media (hover: hover)` 안에만 둔다. 터치 화면에서 눌린 색이 남지 않게 한다.
- 가로로 눕힌 휴대폰처럼 높이가 낮은 화면(500px 미만)에서는 구를 작게 하고, 헤더 고정을 푼다.
- 노치·홈 막대 영역은 `env(safe-area-inset-*)`로 비워 둔다.

### 6-10. 수직 리듬

위아래 방향의 모든 치수를 **4px 격자** 위에 놓는다. 글줄, 간격, 박스 높이가 같은 박자로 쌓이면 화면이 정돈되어 보인다.

**규칙 1. 줄 높이는 4px 배수의 px 값으로 고정한다.** `1.65` 같은 비율로 쓰면 16px × 1.65 = 26.4px처럼 격자에서 어긋난다.

| 글자 | 크기 | 줄 높이 | 토큰 |
|---|---|---|---|
| display | 34 / 40 / 44px | 44 / 52 / 56px | `--lh-display` |
| h1 | 26 / 28 / 32px | 36 / 36 / 40px | `--lh-h1` |
| h2 | 20 / 20 / 22px | 28 / 28 / 32px | `--lh-h2` |
| h3 | 17px | 24px | `--lh-h3` |
| 본문 | 16px | 28px | `--lh-body` |
| 보조 본문 | 15px | 24px | `--lh-body-sm` |
| 라벨 | 14px | 20px | `--lh-label` |
| 캡션 | 13px | 20px | `--lh-caption` |
| 입력창 글자 | 16px | 24px | — |

(크기는 mobile / tablet / desktop 순서)

**규칙 2. 박스 높이 = 위아래 패딩 + 줄 높이 × 줄 수가 4px 배수가 되게 한다.**
- 챗봇 말풍선: 14 + 28 + 14 = 56px (한 줄), 줄이 늘 때마다 28px씩
- 학생 말풍선: 12 + 28 + 12 = 52px
- 배지: 4 + 20 + 4 = 28px
- 버튼 36 / 44 / 52px, 입력창 48px, 입력바 56px, 헤더 56 / 64px
- 높이가 내용에 따라 정해지는 유리 요소(카드, 말풍선, 칩, 입력바, 바텀시트)는 테두리를 `border`가 아니라 안쪽 선(`inset` 그림자)으로 그린다. `border`는 위아래로 2px을 더해 격자를 깨뜨린다.

**규칙 3. 간격도 4px 배수만 쓴다.** 6px, 10px 같은 값은 쓰지 않는다. (예외는 바깥 높이가 4px 배수로 고정된 경우뿐이다: 입력바 안쪽 6px은 6 + 44 + 6 = 56px이 된다)

**규칙 4. 섹션과 섹션 사이는 본문 줄 높이(28px)보다 커야 한다.** 그래야 문단 사이와 구역 사이가 구분된다. (섹션 사이 32 / 40 / 48px)

### 6-11. 시각적 균형

요소마다 눈을 끄는 **무게**가 다르다. 무게가 한쪽에 몰리지 않게 나눈다.

**무게 순서** (무거운 것부터)
1. 진한 마젠타 그라데이션 (Primary 버튼, 학생 말풍선)
2. 큰 세리프 제목 (display, h1)
3. 구, 이미지, 진한 색 블록
4. 유리 카드, 배지
5. 본문 글자
6. 여백

**규칙 1. 한 화면(스크롤 없이 보이는 높이) 안에 1–3번 무게의 요소는 최대 3개.** 서로 위아래나 대각선으로 떨어뜨리고, 같은 쪽에 몰아 두지 않는다.
- 휴대폰 첫 화면: 위쪽에 구와 제목, 아래쪽에 입력바와 보내기 버튼 → 위아래 균형
- 담당자 화면: 왼쪽 위 제목, 오른쪽 위 Primary 버튼 → 대각선 균형

**규칙 2. 색 비율은 60 : 30 : 10.** 배경 60%, 유리 카드·중간색 30%, 강조색(마젠타) 10% 이하.

**규칙 3. 주 + 보조 배치(8 + 4칸)에서 보조 칸의 내용 높이는 주 칸의 40–100%.** 40%보다 적으면 보조 칸에 내용을 더 모으거나(관련 정보 묶기) 한 줄 전체 배치로 바꾼다.

**규칙 4. 같은 줄의 카드는 같은 구조를 쓴다.** 배지 → 제목 → 본문 → 버튼처럼 순서와 위치가 같아야 한다. 하나만 이미지가 있거나 배지 위치가 다르면 기울어 보인다.

**규칙 5. 가운데 정렬 화면은 광학 중심에 맞춘다.** 사람 눈은 수학적 가운데보다 살짝 위를 가운데로 느낀다. 히어로·빈 화면 안내·모달 안 내용은 **위 여백 : 아래 여백 = 2 : 3**으로 둔다.

**규칙 6. 좌우 여백은 항상 같다.** 페이지, 카드, 버튼 안쪽 모두 왼쪽과 오른쪽 여백이 같아야 한다. (입력바처럼 오른쪽에 버튼이 붙는 경우만 예외)

**규칙 7. 모양 보정.** 보내기 아이콘(삼각형)은 무게가 왼쪽에 쏠려 보이므로 오른쪽으로 1px 옮긴다. 원형 아이콘 버튼 안의 아이콘은 정가운데에 둔다.

---

## 7. 움직임

| 토큰 | 값 | 용도 |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 대부분 |
| `--dur-fast` | 160ms | 버튼, hover |
| `--dur-base` | 240ms | 말풍선 등장, 칩 선택 |
| `--dur-slow` | 400ms | 모달, 바텀시트 |

- 말풍선 등장: 아래 8px에서 올라오며 투명도 0→1.
- 구: 숨쉬기 `scale(1 ↔ 1.04)` 6초 반복.
- `prefers-reduced-motion: reduce`이면 모든 애니메이션·전환 0에 가깝게.

---

## 8. 접근성 체크

- 본문 대비 4.5:1, 큰 글자(24px+ 또는 19px 굵게) 3:1 이상.
- 유리 위 글자는 바탕 투명도 0.55 이상인 유리에만 올린다.
- `backdrop-filter` 미지원 브라우저는 유리 바탕을 `rgba(255,255,255,0.92)`로 대체.
- 아이콘 전용 버튼은 `aria-label` 필수 ("닫기", "보내기").
- 채팅 목록은 `aria-live="polite"`로 새 답변을 읽어 준다.
- 색만으로 상태를 구분하지 않는다 (글자·아이콘 함께).

---

## 9. CSS — 토큰과 기본 스타일

`app/globals.css`에 그대로 넣어 쓰는 기준 코드다.

```css
/* ========== 1. 토큰 ========== */
:root {
  /* 배경 */
  --bg-base: #F7F2FB;
  --bg-blush: #FBEFF6;
  --bg-lilac: #EEE6FA;
  --bg-gradient: linear-gradient(160deg, #FBEFF6 0%, #F7F2FB 45%, #EEE6FA 100%);

  /* 빛 */
  --glow-pink: #F5B8DA;
  --glow-magenta: #E77FCF;
  --glow-lilac: #C9B6F2;
  --glow-sky: #B9C9F5;
  --glow-peach: #FAD3C4;

  /* 브랜드 */
  --brand-600: #A12E92;
  --brand-500: #C43BA8;
  --brand-300: #E77FCF;
  --brand-100: #FBE3F3;
  --brand-gradient: linear-gradient(135deg, #A12E92 0%, #C43BA8 100%);
  --accent-lavender: #7B6BB0;

  /* 글자 */
  --text-strong: #231C36;
  --text-body: #3A3350;
  --text-sub: #5E5675;
  --text-muted: #736B8A;
  --text-placeholder: #8F88A3;
  --text-on-brand: #FFFFFF;

  /* 상태 */
  --success: #1F7A55;  --success-bg: #E3F5EC;
  --warning: #8A5A00;  --warning-bg: #FFF3D6;
  --danger:  #B4233C;  --danger-bg:  #FDE6EA;
  --info:    #3F55A8;  --info-bg:    #E6ECFB;

  /* 유리 */
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-strong: rgba(255, 255, 255, 0.75);
  --glass-bg-subtle: rgba(255, 255, 255, 0.35);
  --glass-border: rgba(255, 255, 255, 0.7);
  --glass-border-soft: rgba(164, 140, 200, 0.18);
  --glass-blur: 20px;
  --glass-blur-strong: 32px;
  /* 윗면 빛 + 1px 테두리 선. border 대신 inset으로 그려서 박스 높이를 늘리지 않는다 (6-10) */
  --glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px var(--glass-border);

  /* 글꼴 */
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-serif-ko: "Gowun Batang", "Nanum Myeongjo", serif;
  --font-serif-en: "Instrument Serif", Georgia, serif;

  --fs-display: 34px;
  --fs-h1: 26px;
  --fs-h2: 20px;
  --fs-h3: 17px;
  --fs-body: 16px;
  --fs-body-sm: 15px;
  --fs-caption: 13px;
  --fs-button: 15px;

  /* 줄 높이 (4px 배수, 6-10) */
  --lh-display: 44px;
  --lh-h1: 36px;
  --lh-h2: 28px;
  --lh-h3: 24px;
  --lh-body: 28px;
  --lh-body-sm: 24px;
  --lh-label: 20px;
  --lh-caption: 20px;

  /* 간격 */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 20px;  --space-6: 24px;  --space-8: 32px;  --space-10: 40px;
  --space-12: 48px; --space-16: 64px;
  --page-x: var(--space-4);
  --section-gap: var(--space-8);

  /* 둥글기 */
  --radius-xs: 6px;  --radius-sm: 12px; --radius-md: 16px;
  --radius-lg: 24px; --radius-xl: 32px; --radius-pill: 999px;

  /* 그림자 */
  --shadow-sm: 0 2px 8px rgba(120, 90, 170, 0.08);
  --shadow-md: 0 8px 24px rgba(120, 90, 170, 0.12);
  --shadow-lg: 0 20px 48px rgba(120, 90, 170, 0.16);
  --shadow-glow: 0 8px 24px rgba(196, 59, 168, 0.35);
  --focus-ring: 0 0 0 3px rgba(196, 59, 168, 0.45);

  /* 움직임 */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur-fast: 160ms;
  --dur-base: 240ms;
  --dur-slow: 400ms;

  /* 레이아웃 */
  --chat-max: 720px;
  --admin-max: 1120px;
  --wide-max: 1280px;
  --measure: 36em;              /* 본문 한 줄 최대 길이 (한글 35–40자) */
  --header-h: 56px;

  /* 그리드 (mobile) */
  --grid-cols: 4;
  --gutter: var(--space-4);
  --card-pad: var(--space-4);

  /* 겹침 순서 */
  --z-sticky: 20;   /* 헤더 */
  --z-fixed: 30;    /* 하단 입력바 */
  --z-overlay: 50;  /* 모달·바텀시트 */
  --z-toast: 60;    /* 토스트 */
}

@media (min-width: 768px) {
  :root {
    --page-x: var(--space-6);
    --section-gap: var(--space-10);
    --grid-cols: 8;
    --gutter: var(--space-6);
    --card-pad: var(--space-5);
    --fs-display: 40px;
    --fs-h1: 28px;
    --lh-display: 52px;
  }
}
@media (min-width: 1024px) {
  :root {
    --page-x: var(--space-10);
    --section-gap: var(--space-12);
    --grid-cols: 12;
    --card-pad: var(--space-6);
    --fs-display: 44px;
    --fs-h1: 32px;
    --fs-h2: 22px;
    --lh-display: 56px;
    --lh-h1: 40px;
    --lh-h2: 32px;
    --header-h: 64px;
  }
}

/* ========== 2. 기본 ========== */
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  min-height: 100dvh;
  background: var(--bg-base);
  background-image: var(--bg-gradient);
  background-attachment: fixed;
  color: var(--text-body);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  letter-spacing: -0.01em;
  word-break: keep-all;          /* 한국어 단어 단위 줄바꿈 (필수) */
  overflow-wrap: anywhere;       /* 긴 URL·이메일만 강제로 끊음 */
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { margin: 0; color: var(--text-strong); letter-spacing: -0.02em; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }
p + p { margin-top: var(--space-3); }

.t-display { font-family: var(--font-serif-ko); font-size: var(--fs-display); line-height: var(--lh-display); font-weight: 700; }
.t-display em, .t-accent { font-style: normal; color: var(--accent-lavender); }
.t-h1 { font-family: var(--font-serif-ko); font-size: var(--fs-h1); line-height: var(--lh-h1); font-weight: 700; }
.t-h2 { font-size: var(--fs-h2); line-height: var(--lh-h2); font-weight: 700; }
.t-h3 { font-size: var(--fs-h3); line-height: var(--lh-h3); font-weight: 600; }
.t-sub { font-size: var(--fs-body-sm); line-height: var(--lh-body-sm); color: var(--text-sub); }
.t-caption { font-size: var(--fs-caption); line-height: var(--lh-caption); font-weight: 500; color: var(--text-muted); letter-spacing: 0; }
.t-num { font-variant-numeric: tabular-nums; }
.t-en { font-family: var(--font-serif-en); }

:focus-visible { outline: none; box-shadow: var(--focus-ring); }

/* ========== 3. 배경 번짐 ========== */
.bg-blobs { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.bg-blobs::before,
.bg-blobs::after {
  content: ""; position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6;
}
.bg-blobs::before { width: 420px; height: 420px; top: -120px; left: -120px; background: var(--glow-pink); }
.bg-blobs::after  { width: 380px; height: 380px; bottom: -100px; right: -120px; background: var(--glow-lilac); }

/* ========== 4. 유리 ========== */
.glass {
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  backdrop-filter: blur(var(--glass-blur)) saturate(140%);
  box-shadow: var(--shadow-md), var(--glass-inset);
}
.glass--strong { background: var(--glass-bg-strong); }
.glass--subtle { background: var(--glass-bg-subtle); box-shadow: var(--shadow-sm), var(--glass-inset); }

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass, .glass--strong, .glass--subtle { background: rgba(255, 255, 255, 0.92); }
}

/* ========== 5. 레이아웃 ========== */
.container { width: 100%; max-width: var(--chat-max); margin-inline: auto; padding-inline: var(--page-x); }
.container--admin { max-width: var(--admin-max); }
.container--wide { max-width: var(--wide-max); }
.section + .section { margin-top: var(--section-gap); }
.stack-2 > * + * { margin-top: var(--space-2); }
.stack-3 > * + * { margin-top: var(--space-3); }
.stack-4 > * + * { margin-top: var(--space-4); }
.stack-6 > * + * { margin-top: var(--space-6); }

/* ========== 6. 헤더 ========== */
.header {
  position: sticky; top: 0; z-index: var(--z-sticky);
  height: var(--header-h);
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-2) var(--page-x);
  background: var(--glass-bg);
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border-soft);
}

/* ========== 7. 버튼 ========== */
.btn {
  --btn-h: 44px; --btn-px: var(--space-5); --btn-fs: var(--fs-button);
  position: relative;
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  height: var(--btn-h); padding: 0 var(--btn-px);
  border: 1px solid transparent; border-radius: var(--radius-pill);
  font: 600 var(--btn-fs)/20px var(--font-sans); letter-spacing: -0.01em;
  white-space: nowrap; cursor: pointer; user-select: none;
  transition: transform var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              background-color var(--dur-fast) var(--ease-out),
              filter var(--dur-fast) var(--ease-out);
}
.btn svg { width: 18px; height: 18px; flex: none; }
.btn:active { transform: scale(0.97); }
.btn:disabled, .btn[aria-disabled="true"] { opacity: 0.45; box-shadow: none; cursor: not-allowed; transform: none; }

/* 터치 영역 44px 보장 (sm) */
.btn--sm { --btn-h: 36px; --btn-px: 14px; --btn-fs: 14px; }
.btn--sm::after { content: ""; position: absolute; inset: -4px 0; }
.btn--lg { --btn-h: 52px; --btn-px: 28px; --btn-fs: 16px; }
.btn--block { display: flex; width: 100%; }

.btn--primary { background: var(--brand-gradient); color: var(--text-on-brand); box-shadow: var(--shadow-glow); }

.btn--secondary {
  background: var(--glass-bg-strong); color: var(--text-strong);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-sm), var(--glass-inset);
}

.btn--ghost { background: transparent; color: var(--brand-600); }

.btn--soft { background: var(--brand-100); color: var(--brand-600); }

.btn--danger { background: var(--danger); color: #fff; }

/* 아이콘 버튼 */
.btn--icon { --btn-px: 0; width: var(--btn-h); padding: 0; }
.btn--icon.btn--glass {
  background: var(--glass-bg); color: var(--text-body);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-sm), var(--glass-inset);
}
.btn--icon.btn--sm::after { inset: -4px; }
.btn--icon.btn--lg svg { width: 22px; height: 22px; }

/* 로딩 */
.btn[aria-busy="true"] { color: transparent; pointer-events: none; }
.btn[aria-busy="true"]::before {
  content: ""; position: absolute; width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid currentColor; border-color: rgba(255,255,255,0.9) rgba(255,255,255,0.9) transparent transparent;
  animation: spin 0.8s linear infinite;
}
.btn--secondary[aria-busy="true"]::before,
.btn--ghost[aria-busy="true"]::before,
.btn--soft[aria-busy="true"]::before { border-color: var(--brand-500) var(--brand-500) transparent transparent; }

/* ========== 8. 칩 ========== */
.chips { display: flex; gap: var(--space-2); overflow-x: auto; scroll-snap-type: x mandatory;
  padding-inline: var(--page-x); margin-inline: calc(var(--page-x) * -1); scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip {
  flex: none; scroll-snap-align: start;
  display: inline-flex; align-items: center; gap: var(--space-2);
  min-height: 44px; padding: var(--space-2) 14px;
  border-radius: var(--radius-md);
  background: var(--glass-bg-subtle);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  font: 500 var(--fs-body-sm)/20px var(--font-sans); color: var(--text-body);
  cursor: pointer; transition: background-color var(--dur-base) var(--ease-out);
}
.chip__icon { width: 28px; height: 28px; border-radius: 8px; background: var(--brand-100);
  display: grid; place-items: center; color: var(--brand-600); }
.chip { border: 0; box-shadow: inset 0 0 0 1px var(--glass-border); }
.chip[aria-pressed="true"] { background: var(--brand-100); box-shadow: inset 0 0 0 1px var(--brand-300); }

/* ========== 9. 카드 ========== */
/* 카드 = 머리(제목) / 몸통 / 꼬리(버튼·메타). 꼬리는 바닥에 붙는다 (6-4 규칙 4) */
.card {
  display: flex; flex-direction: column; min-width: 0;
  border-radius: var(--radius-lg); padding: var(--card-pad);
}
.card--lg { padding: max(var(--card-pad), var(--space-5)); }
.card--sm { padding: var(--space-3); border-radius: var(--radius-sm); }
.card--center { justify-content: center; }          /* 꼬리 없는 짧은 카드 */
.card__title { font-size: var(--fs-h3); font-weight: 600; color: var(--text-strong); }
.card__title + * { margin-top: var(--space-2); }
.card__body > * + * { margin-top: var(--space-3); }
.card__footer { margin-top: auto; padding-top: var(--space-4); display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
.card-list > * + * { margin-top: var(--space-3); }

/* ========== 10. 말풍선 ========== */
.chat { display: flex; flex-direction: column; padding-bottom: calc(56px + var(--space-4) * 2 + 24px); }
.msg { max-width: 88%; animation: rise var(--dur-base) var(--ease-out) both; }
.msg + .msg { margin-top: var(--space-4); }
.msg--same + .msg--same { margin-top: var(--space-2); }

.bubble { padding: 14px var(--space-4); border-radius: var(--radius-lg); font-size: var(--fs-body); line-height: var(--lh-body); }
.msg--bot { align-self: flex-start; }
.msg--bot .bubble {
  background: var(--glass-bg-strong); color: var(--text-body);
  border-top-left-radius: 8px;
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-sm), var(--glass-inset);
}
.msg--me { align-self: flex-end; max-width: 82%; }
.msg--me .bubble {
  background: var(--brand-gradient); color: var(--text-on-brand);
  padding: var(--space-3) var(--space-4); border-bottom-right-radius: 8px;
  box-shadow: 0 6px 16px rgba(196, 59, 168, 0.22);
}
.msg__meta { margin-top: var(--space-1); }
.msg--me .msg__meta { text-align: right; }
.msg__actions { margin-top: var(--space-2); display: flex; flex-wrap: wrap; gap: var(--space-2); }

/* 근거 조항 배지 */
.badge {
  display: inline-flex; align-items: center; gap: var(--space-1);
  padding: var(--space-1) var(--space-2); border-radius: var(--radius-xs);
  font: 600 var(--fs-caption)/var(--lh-caption) var(--font-sans); letter-spacing: 0;
}
.badge--info    { color: var(--info);    background: var(--info-bg); }
.badge--success { color: var(--success); background: var(--success-bg); }
.badge--warning { color: var(--warning); background: var(--warning-bg); }
.badge--danger  { color: var(--danger);  background: var(--danger-bg); }
.badges { margin-top: var(--space-2); display: flex; flex-wrap: wrap; gap: var(--space-2); }

/* ========== 11. 하단 입력바 ========== */
.composer-wrap {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: var(--z-fixed);
  padding: var(--space-6) var(--page-x) max(var(--space-3), env(safe-area-inset-bottom));
  /* 아래로 갈수록 배경색이 진해져서, 주의 문구가 말풍선 위에 겹쳐도 읽힌다 */
  background: linear-gradient(to top, rgba(238, 230, 250, 0.96) 55%, rgba(238, 230, 250, 0));
}
.composer-wrap > * { max-width: var(--chat-max); margin-inline: auto; }
.composer__notice { margin-bottom: var(--space-2); text-align: center; }
.composer {
  display: flex; align-items: flex-end; gap: var(--space-2);
  min-height: 56px; padding: 6px 6px 6px var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--glass-bg-strong);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)); backdrop-filter: blur(var(--glass-blur-strong));
  box-shadow: var(--shadow-lg), var(--glass-inset);
}
.composer[data-multiline="true"] { border-radius: var(--radius-lg); }
.composer__input {
  flex: 1; min-height: 44px; max-height: calc(16px * 1.5 * 4 + 20px);
  padding: 10px 0; border: 0; outline: 0; resize: none; background: transparent;
  font: 400 16px/1.5 var(--font-sans); color: var(--text-strong);
}
.composer__input::placeholder { color: var(--text-placeholder); }
.composer__count { align-self: center; font-size: var(--fs-caption); color: var(--text-muted); font-variant-numeric: tabular-nums; }
.composer__count[data-over="true"] { color: var(--danger); }
.btn--send svg { transform: translateX(1px); }   /* 모양 보정 (6-11 규칙 7) */
.btn--send { --btn-h: 44px; width: 44px; padding: 0; background: var(--brand-gradient); color: #fff; box-shadow: var(--shadow-glow); }

/* ========== 12. 폼 ========== */
.field + .field { margin-top: var(--space-4); }
.field__label { display: block; margin-bottom: var(--space-2); font-size: 14px; line-height: var(--lh-label); font-weight: 600; color: var(--text-strong); }
.field__label small { font-size: inherit; font-weight: 500; color: var(--text-sub); }  /* 글자 크기가 섞이면 줄 높이가 늘어나므로 같은 크기 */
.input, .textarea {
  display: block; width: 100%;   /* inline이면 아래에 글자 기준선 틈이 생김 */ height: 48px; padding: 0 var(--space-4);
  border-radius: var(--radius-sm); border: 1px solid rgba(164, 140, 200, 0.35);
  background: rgba(255, 255, 255, 0.8);
  font: 400 16px/1.5 var(--font-sans); color: var(--text-strong);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.textarea { height: auto; min-height: 120px; padding: var(--space-3) var(--space-4); resize: vertical; }
.input::placeholder, .textarea::placeholder { color: var(--text-placeholder); }
.input:focus, .textarea:focus { outline: none; border-color: var(--brand-500); box-shadow: 0 0 0 4px rgba(196, 59, 168, 0.15); }
.input[aria-invalid="true"], .textarea[aria-invalid="true"] { border-color: var(--danger); }
.field__help, .field__error { margin-top: var(--space-2); font-size: var(--fs-caption); line-height: var(--lh-caption); }
.field__help { color: var(--text-muted); }
.field__error { color: var(--danger); display: flex; gap: var(--space-1); align-items: flex-start; }
.form__actions { margin-top: var(--space-6); display: flex; gap: var(--space-2); }

/* ========== 13. 모달 / 바텀시트 ========== */
.overlay { position: fixed; inset: 0; z-index: var(--z-overlay); background: rgba(35, 28, 54, 0.25);
  -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); display: flex; align-items: flex-end; }
.sheet {
  width: 100%; max-height: 90dvh; overflow: auto;
  padding: var(--space-2) var(--space-6) max(var(--space-6), env(safe-area-inset-bottom));
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  background: var(--glass-bg-strong);
  -webkit-backdrop-filter: blur(var(--glass-blur-strong)); backdrop-filter: blur(var(--glass-blur-strong));
  box-shadow: var(--shadow-lg), var(--glass-inset);
  animation: sheet-up var(--dur-slow) var(--ease-out) both;
}
.sheet__handle { width: 36px; height: 4px; border-radius: 2px; background: rgba(35, 28, 54, 0.15); margin: 0 auto var(--space-5); }
.sheet__title + * { margin-top: var(--space-2); }
.sheet__actions { margin-top: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2); }
@media (min-width: 768px) {
  .overlay { align-items: center; justify-content: center; }
  .sheet { max-width: 480px; border-radius: var(--radius-lg); padding-top: var(--space-6); }
  .sheet__handle { display: none; }
  .sheet__actions { flex-direction: row-reverse; }
}

/* ========== 14. 토스트 ========== */
.toast {
  position: fixed; top: var(--space-4); left: 50%; transform: translateX(-50%); z-index: var(--z-toast);
  max-width: calc(100% - 32px);
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-md);
  font-size: var(--fs-body-sm);
}

/* ========== 15. 구(Orb) ========== */
.orb {
  --orb-size: 160px;
  position: relative; width: var(--orb-size); aspect-ratio: 1; border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 32%),
    radial-gradient(circle at 70% 70%, var(--glow-sky) 0%, transparent 55%),
    radial-gradient(circle at 30% 75%, var(--glow-peach) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, var(--glow-magenta) 0%, var(--glow-pink) 45%, var(--glow-lilac) 100%);
  box-shadow:
    0 0 0 14px rgba(255,255,255,0.35),
    0 0 0 28px rgba(255,255,255,0.18),
    0 24px 60px rgba(196, 59, 168, 0.30);
  animation: breathe 6s var(--ease-out) infinite alternate;
}
.orb--sm { --orb-size: 32px; box-shadow: 0 0 0 4px rgba(255,255,255,0.4), 0 6px 16px rgba(196,59,168,0.3); }
@media (min-width: 1024px) { .orb:not(.orb--sm) { --orb-size: 220px; } }

/* ========== 16. 표 (담당자 화면) ========== */
.table { width: 100%; border-collapse: collapse; font-size: var(--fs-body-sm); }
.table th { padding: var(--space-3) var(--space-4); text-align: left; font-size: var(--fs-caption); font-weight: 600; color: var(--text-sub); }
.table td { height: 52px; padding: var(--space-3) var(--space-4); border-top: 1px solid var(--glass-border-soft); }

/* ========== 16-1. hover — 마우스가 있는 기기에서만 (터치 화면에 눌린 색이 남지 않게) ========== */
@media (hover: hover) {
  .btn--primary:hover { filter: brightness(1.06); box-shadow: 0 10px 28px rgba(196, 59, 168, 0.45); }
  .btn--secondary:hover { background: rgba(255, 255, 255, 0.9); }
  .btn--ghost:hover { background: var(--brand-100); }
  .btn--soft:hover { background: #F7D3EC; }
  .btn--danger:hover { filter: brightness(1.06); }
  .chip:hover { background: var(--glass-bg-strong); }
}

/* ========== 17. 그리드 · 레이아웃 (6장) ========== */
/* 기본: 모든 자식은 한 줄 전체. span 클래스로 칸 수를 정한다.
   같은 줄 박스는 자동으로 높이가 같아진다 (align-items: stretch). */
.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), minmax(0, 1fr));
  gap: var(--gutter);
  align-items: stretch;
}
.grid > * { min-width: 0; grid-column: 1 / -1; }

/* mobile (4칸) */
.m-span-2 { grid-column: span 2; }
.m-span-4 { grid-column: span 4; }

/* tablet (8칸) */
@media (min-width: 768px) {
  .t-span-2 { grid-column: span 2; }
  .t-span-4 { grid-column: span 4; }
  .t-span-8 { grid-column: span 8; }
}

/* desktop (12칸) */
@media (min-width: 1024px) {
  .d-span-2  { grid-column: span 2; }
  .d-span-3  { grid-column: span 3; }
  .d-span-4  { grid-column: span 4; }
  .d-span-6  { grid-column: span 6; }
  .d-span-8  { grid-column: span 8; }
  .d-span-12 { grid-column: span 12; }
}

/* 자주 쓰는 배치 묶음: mobile 1열 → tablet 2열 → desktop N열 */
.layout-2, .layout-3, .layout-4 { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--gutter); align-items: stretch; }
.layout-2 > *, .layout-3 > *, .layout-4 > * { min-width: 0; }
@media (min-width: 768px) {
  .layout-2, .layout-3, .layout-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  /* 외톨이 금지: 2열일 때 개수가 홀수면 마지막 박스를 줄 전체로 */
  .layout-3 > :last-child:nth-child(odd),
  .layout-4 > :last-child:nth-child(odd) { grid-column: 1 / -1; }
}
@media (min-width: 1024px) {
  .layout-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .layout-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .layout-3 > :last-child:nth-child(odd),
  .layout-4 > :last-child:nth-child(odd) { grid-column: auto; }
}

/* 2:1 쌓기 — 짧은 박스 2개를 세로로 쌓아 긴 박스 옆에 (6-4 규칙 3) */
.stack-pair { display: grid; grid-template-rows: 1fr 1fr; gap: var(--gutter); min-width: 0; }

/* 본문 한 줄 길이 제한 */
.measure { max-width: var(--measure); }

/* 높이가 낮은 화면 (가로로 눕힌 휴대폰) */
@media (max-height: 500px) and (orientation: landscape) {
  .header { position: static; }
  .orb:not(.orb--sm) { --orb-size: 96px; }
}

/* ========== 18. 애니메이션 ========== */
@keyframes rise     { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes sheet-up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes breathe  { from { transform: scale(1); } to { transform: scale(1.04); } }
@keyframes spin     { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important; scroll-behavior: auto !important;
  }
}
```

---

## 10. 예시 마크업

```html
<body>
  <div class="bg-blobs" aria-hidden="true"></div>

  <header class="header">
    <strong>AX마스터 학사 도우미</strong>
    <button class="btn btn--icon btn--glass btn--sm" aria-label="메뉴">…</button>
  </header>

  <main class="container">
    <section class="section stack-3" style="padding-top: var(--space-6)">
      <h1 class="t-display"><em>안녕하세요,</em><br />무엇이 궁금하세요?</h1>
      <p class="t-sub">학사규정을 근거로 바로 답해 드리고, 판단이 필요한 문의는 담당자에게 접수해 드려요.</p>
    </section>

    <section class="section">
      <div class="chips" role="list">
        <button class="chip" role="listitem"><span class="chip__icon">✓</span>공결 인정 사유</button>
        <button class="chip" role="listitem"><span class="chip__icon">₩</span>환불 계산</button>
        <button class="chip" role="listitem"><span class="chip__icon">!</span>지각 기준</button>
      </div>
    </section>

    <section class="section chat" aria-live="polite">
      <div class="msg msg--me"><div class="bubble">면접 때문에 결석하면 공결되나요?</div></div>
      <div class="msg msg--bot">
        <div class="bubble">채용업체의 면접·필기전형 참가는 전체 기간 중 10일까지 공결로 인정돼요. 면접확인서·수험표·전형안내 메일 중 하나를 내야 해요.</div>
        <div class="badges"><span class="badge badge--info">제7조</span></div>
      </div>
    </section>
  </main>

  <div class="composer-wrap">
    <p class="composer__notice t-caption">성적 등 개인정보는 입력하지 마세요.</p>
    <form class="composer">
      <textarea class="composer__input" rows="1" placeholder="학사규정을 물어보세요"></textarea>
      <button class="btn btn--send btn--icon" aria-label="보내기">➤</button>
    </form>
  </div>
</body>
```

---

## 11. 하지 말 것

- 흰 바탕 위에 유리 효과 쓰기.
- 밝은 핑크(`#E77FCF` 이하 밝기) 바탕에 흰 글자 올리기.
- 토큰에 없는 간격·둥글기·색을 직접 쓰기. 4px 배수가 아닌 간격·줄 높이 쓰기.
- 유리 겹치기 3단 이상 (블러가 쌓이면 흐리고 느려진다).
- 한 화면에 Primary 버튼 2개 이상.
- 16px 미만 입력창 글자.
- `word-break: keep-all` 빼먹기.
- 박스 폭을 그리드 칸이 아닌 임의 숫자로 정하기.
- 글이 들어간 박스에 고정 `height` 주기.
- 같은 줄에 내용 양이 크게 다른 박스 두기 (짧은 박스 아래에 빈 공간이 몰림).
- 빈 줄이나 `<br>`, 큰 패딩으로 박스를 채우기.
- 마지막 줄에 박스 1개만 외톨이로 남기기.
- 장식이 아닌 요소를 `position: absolute`로 배치하기, 음수 마진 쓰기.
- 진한 요소(Primary 버튼, 진한 색 블록, 구, 큰 제목)를 한쪽에 몰아 두기.
