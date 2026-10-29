# Portfolio

Vite 기반 HTML/CSS/JavaScript UI/UX 디자이너 포트폴리오 프로토타입입니다.
페이지는 HERO → PROJECT → ABOUT → CONTACT 순서로 구성됩니다.
REDESIGN 목록, 가족센터의 원본 이미지 상세페이지, TANGLE·MONAMI의 임시 상세 안내 화면을 포함합니다.

## 시작하기

모든 명령은 저장소 루트에서 실행합니다. Node.js 24.19.0과 npm을 사용합니다.
다른 Node.js 버전을 사용하는 경우 Vite의 요구 사항(`^20.19.0 || >=22.12.0`)을 충족해야 합니다.

```sh
npm ci
npm run dev
```

## 빌드

```sh
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성됩니다. `preview`는 빌드 결과를 로컬에서 확인하는 용도입니다.

### 단일 HTML 미리보기

Vite 서버 없이 HTML 파일을 여는 뷰어에서는 소스 `index.html`을 직접 열 수 없습니다.
다음 명령은 JavaScript·CSS·이미지·필요한 폰트를 포함한 `preview.html`을 저장소 루트에 생성합니다.

```sh
npm run build:preview
```

생성된 파일은 별도 서버나 외부 자산 요청 없이 사용할 수 있습니다. REDESIGN 목록과 세 임시 상세 경로도 파일 안에 포함하며, 목록·상세·메인 복귀를 오프라인으로 탐색할 수 있습니다. 실제 사이트에서는 정상적인 페이지 URL과 브라우저 이력을 사용하고, 서버 없는 뷰어에서만 격리된 내장 화면으로 연결합니다. 원본 이미지는 압축·리사이즈하지 않고 포함하며, 큰 이미지 데이터는 가족센터 상세 문서를 열 때만 연결해 다른 오프라인 경로를 가볍게 유지합니다. 콘텐츠를 수정한 뒤에는 다시 생성하세요.
`preview.html`은 생성물로 Git에서 제외되며, 일반 개발은 기존 `npm run dev`를 사용합니다.

큰 단일 HTML이 열리지 않는 뷰어에서는 다음 명령으로 다운로드용 미리보기를 생성할 수 있습니다.

```sh
node scripts/build-preview.mjs --download
```

결과는 `.vite/download-preview/`입니다. 폴더 전체를 복사하거나 압축을 푼 뒤 `index.html`을 브라우저로 여세요. 각 HTML에는 스크립트·스타일·폰트가 포함되어 설치나 서버 없이 탐색할 수 있습니다. 가족센터 PNG는 별도 `assets/` 파일로 원본 그대로 유지하므로 HTML만 따로 옮기지 마세요. 실제 사이트의 코드와 경로는 변경하지 않습니다.

## 기본 구조

```text
index.html               메인 HTML 진입점 및 메타 정보
redesign/index.html      REDESIGN 목록 진입점
redesign/family-center/index.html  가족센터 원본 이미지 상세 진입점
redesign/tangle/index.html  TANGLE 임시 상세 진입점
redesign/monami/index.html  MONAMI 임시 상세 진입점
vite.config.js           다섯 개 HTML의 프로덕션 빌드 입력
src/main.js              화면 렌더링 및 인터랙션
src/data.js              프로필, 메인 카테고리 및 쇼릴 데이터
src/work-data.js         REDESIGN 목록 문구 및 프로젝트 배열
src/redesign.js          목록·상세 화면 선택 및 렌더링
src/family-center-detail.js  가족센터 원본 이미지 갤러리와 하단 내비게이션
src/family-center-detail.css  원본 비율·최대 너비·모바일 스타일
src/assets/family-center/    업로드된 표지·전체 포트폴리오 PNG 원본
src/redesign.css         새 페이지 전용 스타일
src/page-header.js       보조 페이지의 공통 Header
src/hover-cursor.js      썸네일용 VIEW MORE 커서
src/style.css            Desktop 우선 반응형 레이아웃
src/sections.js          ABOUT·CONTACT 렌더링 및 인터랙션
src/sections.css         ABOUT·CONTACT 전용 스타일
src/motion.js            공통 Reveal 및 카테고리 텍스트 모션
src/reading.js           ABOUT 흐름형 목록의 스크롤 읽기 강조
src/reading.css          ABOUT 네 줄 유지 및 opacity 강조 스타일
src/category-transition.css  PROJECT 카테고리 전용 3D 패널 레이어
src/motion.css           레이아웃을 바꾸지 않는 모션 전용 스타일
src/orbits.js            HERO·CONTACT 공통 궤도 그래픽 및 포인트 모션
src/orbits.css           얇은 선·작은 원 모티프와 CONTACT 드래그 방지
public/images/           교체 가능한 로컬 SVG 콘셉트 비주얼
tests/portfolio.spec.js  Playwright 브라우저 테스트
playwright.config.js     테스트 서버 및 브라우저 설정
package.json             패키지 및 실행 스크립트
package-lock.json        의존성 버전 잠금 파일
```

## 인터랙션

- HERO는 큰 제목 → 소개 문구 → 보조 설명을 같은 왼쪽 정렬로 묶습니다. 제목 아래 30px, 두 문구 사이 6px의 간격을 사용합니다. 기존 영문 문구도 그 아래에 이어집니다. 제목·소개 링크에 마우스를 올리면 원형 VIEW PROJECT 커서가 부드럽게 따라옵니다. 클릭 또는 키보드 Enter로 PROJECT에 이동합니다.
- PROJECT는 CSS `position: sticky`로 고정됩니다. 전체 높이는 700svh이며 고정 화면 자체의 높이를 제외한 스크롤 길이를 세 구간으로 나눕니다. 카테고리당 약 두 화면(200svh)만큼 스크롤해야 REDESIGN → PROJECT → VIBE CODING으로 전환합니다. 마지막 카테고리에도 같은 구간을 할당한 뒤 고정이 해제됩니다. 위로 스크롤하면 역순으로 전환합니다.
- 한 개의 대표 비주얼 영역에서 현재 카테고리의 이미지가 3.6초마다 0.5초 cross fade와 작은 scale 효과로 전환하며 반복됩니다. 카테고리가 바뀌면 기존 타이머와 진행 중인 페이드를 즉시 초기화합니다. 이때만 perspective 1400px, Y축 최대 24도 회전, 좌우 8% 이동, scale 0.95의 3D 패널 전환을 사용합니다. 기존 패널의 퇴장 0.34초 → 새 패널의 등장 0.44초 순서로 두 이미지가 섞이지 않게 처리합니다. 왼쪽 활성 상태도 전환 시작과 동시에 바뀝니다. 0.78초 전환이 끝나면 해당 묶음의 첫 이미지부터 3.6초를 새로 셉니다. 빠른 연속·역방향 스크롤에서는 이전 패널과 애니메이션을 취소하고 최신 카테고리에 맞춥니다. 화살표나 수동 슬라이드 버튼은 없습니다.
- PAUSE/PLAY로 자동 전환을 멈추거나 재개할 수 있습니다. 화면 밖이나 백그라운드에서는 자동 전환을 멈춥니다. OS의 움직임 줄이기 설정에서는 자동 재생과 이동 애니메이션이 비활성화됩니다.
- 760px 이하에서는 세로 레이아웃, 가로 카테고리 목록, 짧은 Sticky 구간(전체 370svh, 카테고리당 약 90svh)을 사용합니다. 터치 기기에서는 커스텀 커서를 사용하지 않습니다.
- ABOUT은 기존 약 40:60의 좌우 구성과 문구를 유지합니다. 왼쪽 소개 문장은 지정된 네 줄로 유지되며 Desktop에서는 Sticky로 고정됩니다. 오른쪽 UI DESIGN / WEB DESIGN / INTERACTION은 모두 일반 세로 흐름에 계속 표시하고, 교체·숨김·오른쪽 Pin을 사용하지 않습니다. 현재 항목은 opacity 1, 다른 항목은 0.35입니다. 다음 제목이 화면 상단 36% 지점까지 올라온 뒤에 강조를 넘기며, 작은 역방향 스크롤에는 8%의 여유 구간을 둡니다. 전환은 이동 없이 0.65초 opacity 변화만 사용합니다. 움직임 줄이기 설정에서는 모든 항목을 opacity 1로 표시합니다.
- CONTACT는 전체 폭의 큰 영문 제목 → 안내 문장 → 이메일 CTA → 작은 소셜 링크 → Footer 순서입니다. 제목과 이메일 위에는 HERO와 같은 추종 방식의 144px CONTACT ME 커서가 나타납니다. 커서는 opacity와 scale 0.7 → 1로 부드럽게 나타나며, 13px 텍스트로 가독성을 높였습니다. 이메일과 소셜 링크는 밑줄과 화살표로 가볍게 반응합니다. 터치 기기에서는 커스텀 커서를 표시하지 않습니다. 문의 폼은 없습니다.
- Header의 Work·About·Contact는 각 섹션으로 부드럽게 이동합니다.

## 공통 Motion Design

`src/motion.js`에서 브라우저 기본 Web Animations API와 IntersectionObserver로 구현합니다. GSAP이나 별도 스크롤 라이브러리는 사용하지 않습니다.

- HERO: 기존 줄바꿈 그대로 타이틀 두 줄을 0.14초 차이로 마스크 reveal합니다. 소개 문장, 오른쪽 그래픽은 그 뒤에 순서대로 등장합니다.
- PROJECT: Sticky 계산과 같은 카테고리의 자동 이미지 전환은 유지합니다. 큰 카테고리가 바뀔 때만 3D 패널 전환을 적용하며, 활성 카테고리 텍스트와 설명의 12px / 0.5초 fade-up도 같은 시점에 실행합니다.
- Section Label: PROJECT·ABOUT·CONTACT에 공통 10px / 0.55초 fade-up을 적용합니다.
- ABOUT: 왼쪽 문장은 기존 24px / 0.65초 reveal을 유지합니다. 오른쪽은 `src/reading.js`에서 스크롤에 따른 opacity 강조만 관리합니다. 콘텐츠를 숨기거나 움직이지 않습니다.
- CONTACT: 기존 세 줄을 0.13초 차이로 36px / 0.7초 마스크 reveal합니다. 마지막 포인트는 제목 이후 작게 나타나고 Footer는 opacity만 0.65초에 걸쳐 올라옵니다. 이메일과 소셜 링크의 기존 hover와 커서 추종 방식은 유지하며 CONTACT 커서만 확대합니다.
- 완료된 reveal은 다시 숨기지 않습니다. 빠른 스크롤로 이미 지나간 요소와 큰 화면 이동으로 도착한 콘텐츠는 즉시 최종 상태로 표시합니다. 키보드로 포커스된 영역도 바로 읽을 수 있게 합니다.
- `prefers-reduced-motion: reduce`에서는 이동·마스크·순차 강조를 끄고 모든 기본 콘텐츠를 표시합니다. 실행 중 설정을 바꿔도 진행 중인 모션을 종료하고 즉시 읽을 수 있게 합니다.

색상·글꼴·주요 배치와 PROJECT의 스크롤 구간·같은 카테고리 내 슬라이드 간격은 유지합니다. reveal 종료 시 효과를 제거해 원래 스타일로 돌아옵니다.

## HERO / CONTACT 그래픽 모티프

두 섹션 모두 얇은 궤도선과 작은 연두색 원을 공유합니다. HERO에는 76vw의 큰 궤도를 메인 제목 뒤쪽 배경에 배치합니다. 텍스트보다 아래 레이어에 두고 일부를 화면 밖으로 잘라, 배치를 바꾸지 않으면서 화면 전체를 연결합니다. 선은 최초 진입 시 3초에 걸쳐 그려지고, 작은 포인트는 CONTACT보다 느린 110초 주기로 실제 궤도를 따라 이동합니다. 그래픽은 HERO 경계에서 잘리며 가로 스크롤을 만들지 않습니다. 제목의 밑줄은 반투명 연두색 마커 스트로크로 강조합니다.

CONTACT에는 같은 곡선을 크게 확장한 두 개의 배경 선과 원 하나를 배치합니다. 포인트는 SVG `animateMotion`으로 실제 표시된 경로를 72초에 한 바퀴씩 따라갑니다. 배경은 포인터 이벤트를 받지 않으며 텍스트 아래에 위치합니다. 화면 크기가 바뀌면 경로를 다시 계산해 선과 포인트가 어긋나거나 원이 찌그러지지 않도록 합니다.

섹션이 화면 밖에 있거나 탭이 숨겨지면 궤도 모션을 일시정지합니다. Reduced Motion에서는 시작 위치에 고정합니다. CONTACT의 제목과 이메일 CTA는 텍스트 선택·네이티브 드래그를 막되 실제 클릭, 키보드 포커스, hover와 CONTACT ME 커서는 유지합니다.

## 콘텐츠 변경

`src/data.js`의 `profile`에서 이름과 직무를, `categories`에서 카테고리와 프로젝트를 수정합니다.
프로젝트의 `title`, `subtitle`, `image`, `alt`, `year`, `category`, `link`를 관리할 수 있습니다.
이미지는 `public/images/`에 넣고 `/images/파일명`을 지정합니다. 현재 비주얼은 실제 작업물이 아닌 로컬 SVG placeholder입니다.

`categories[].link`에 URL을 지정하면 카테고리가 해당 목록으로 연결됩니다. REDESIGN은 `/redesign/`에 연결되어 있습니다.
PROJECT와 VIBE CODING은 `null`을 유지하며 준비 중 다이얼로그를 표시합니다. 메인 `projects[].link`는 향후 개별 상세 화면을 위한 데이터 필드이며 쇼릴 이미지를 클릭해 이동하지는 않습니다.

### REDESIGN 목록과 경로

- `/redesign/`: 01 가족센터 / 02 TANGLE / 03 MONAMI 순서로 큰 썸네일을 세로 배치합니다.
- `/redesign/family-center`: 목록의 표지를 클릭하면 전체 포트폴리오(1920×9154) 한 장을 자르거나 분해하지 않고 그대로 표시합니다. 별도 표지는 상세페이지에 중복 배치하지 않으며 `width: 100%; height: auto`, 최대 너비 1280px을 사용합니다. 하단 BACK TO WORK는 메인 SELECTED WORK, NEXT PROJECT는 TANGLE로 연결됩니다.
- `/redesign/tangle/`, `/redesign/monami/`: 준비 중 안내를 유지합니다. 디렉터리 URL의 마지막 `/`는 개발·빌드 미리보기 서버에서 자동 보완합니다.
- 썸네일과 제목은 실제 상세 경로로 연결됩니다. Header의 Work와 BACK TO WORK는 `/#work`로 돌아갑니다. About·Contact·Logo도 메인의 해당 위치에 연결됩니다.
- 썸네일은 Desktop hover 시 기존 128px 원형 스타일과 0.18 추종 계수의 VIEW MORE 커서를 사용하며, 이미지만 1.025배 확대됩니다. Desktop의 일반 영역과 텍스트 링크는 화살표를 유지합니다. 스크롤 중에는 마우스 아래의 실제 요소를 다시 판정해 썸네일 위에서는 커스텀 커서를 유지하고, 벗어나면 화살표로 복귀합니다. 터치/760px 이하에서는 기본 탭으로 동작합니다. 페이지 진입은 12px / 0.55초 fade-up이며 Reduced Motion에서는 생략합니다.
- 목록 문구와 프로젝트는 `src/work-data.js`에서 관리합니다. 각 프로젝트에 `number`, `title`, `category`, `year`, `description`, `thumbnail`, `link`가 있습니다. 메인과 공유하는 제목·이미지·연도는 기존 프로젝트 데이터를 참조합니다. 가족센터 레코드는 `year: '—'`, 임시 `description`, `thumbnail: '/images/family-center-cover.png'`를 직접 수정하면 됩니다. 목록의 가족센터 썸네일은 업로드된 실제 표지를 원본 그대로 사용하며, `thumbnailFit: 'contain'`으로 기존 틀 안에 전체가 보이도록 합니다. 메인 쇼릴은 이번 변경에 포함하지 않으며 FORMA도 그대로 유지됩니다.
- 목록에 작업을 추가할 때는 배열에 새 레코드를 추가하세요. 새 상세 경로도 만들 경우 기존 상세 HTML을 복사해 해당 디렉터리에 두고 `vite.config.js`의 빌드 입력에 추가하면 같은 상세 렌더러를 사용합니다.
- 별도 프레임워크 없이 Vite 다중 HTML로 빌드하므로 위 경로는 직접 열기·새로고침이 가능합니다. 정적 호스팅은 각 디렉터리의 `index.html`을 제공하도록 설정합니다.

`about`의 `statement`와 `introduction`에서 소개 문장, `principles`에서 세 가지 작업 방향, `tools`에서 간결한 Tool 목록을 수정합니다. `contact.channels`의 `display`에서 표시할 이메일 주소를, `href`에서 실제 목적지를 관리합니다. Email의 `href`는 `mailto:실제주소`, 소셜 채널은 전체 HTTPS URL을 지정하세요. Email을 설정하면 CONTACT의 큰 문구와 이메일 CTA가 같은 이메일로 연결됩니다.
현재 모든 연락처는 placeholder이며 `href: null`입니다. 아직 연결되지 않은 버튼은 준비 중 안내를 표시합니다. 이름·연도·문구는 시안 확인용입니다.

DM Sans와 Noto Sans KR 폰트는 npm 패키지에 포함해 로컬에서 제공합니다. 별도 API 키나 외부 이미지 서비스는 필요하지 않습니다.

## 브라우저 테스트

```sh
npx playwright install chromium
npm run test:e2e
```

현재 클라우드 환경에서는 이미 설치된 `/usr/bin/chromium`을 사용하므로 브라우저 설치를 생략할 수 있습니다.
다른 실행 파일은 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`로 지정할 수 있습니다.
테스트 서버는 자동으로 실행되며 개발 서버가 이미 있다면 재사용합니다.

커스텀 커서, HERO 이동, Sticky 유지·해제 및 역방향 스크롤, 카테고리별 자동 순환·반복, 일시정지·재개, 움직임 줄이기 설정, 키보드 다이얼로그, 이미지·폰트 로딩, Desktop 크기별 레이아웃과 터치 레이아웃을 확인합니다. 카테고리별 충분한 스크롤 체류 시간과 페이드 도중 카테고리 변경 시 이미지·타이머 초기화도 검증합니다. ABOUT의 읽기 강조와 Sticky, CONTACT의 커서와 placeholder, Header 연결, 반응형도 포함합니다. HERO와 CONTACT의 순차 reveal, 빠른 스크롤 시 가시성, 실행 중 Reduced Motion 전환을 실제 브라우저 애니메이션으로 검사합니다. 궤도 포인트의 실제 경로 추종·반복·선 그리기·정지 동작과 CTA 클릭도 검증합니다. 서버 없는 단일 HTML에서도 배경 경로 모션을 포함해 오프라인 격리 iframe에서 검증합니다. 카테고리 3D 전환의 회전·불투명도·재생 대기·연속 스크롤 취소와 ABOUT의 세 항목 지속 표시·상단 읽기 기준선·강조 유지·네 줄 고정·모바일 및 Reduced Motion 전환도 확인합니다. REDESIGN의 키보드 진입·큰 썸네일 목록·커서·상세 경로 직접 열기·새로고침·브라우저 이력·메인 복귀·모바일 탭과 오프라인 페이지 탐색도 확인합니다. 커서를 움직이지 않은 채 스크롤하여 썸네일에 진입·체류·이탈·다음 썸네일 진입을 검증하고, 브라우저 pointer가 프레임 중 노출되지 않는지도 확인합니다. 가족센터의 URL 보완·직접 진입·새로고침도 검증합니다. 가족센터 원본 파일과 제공되는 이미지의 SHA-256 일치, 320~2560px에서의 원본 비율·이미지 간격·최대 너비, 하단 내비게이션도 검증합니다. 테스트는 총 45개이며 실행 전에 단일 HTML을 자동 생성합니다.
