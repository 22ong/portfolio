// Replace concept images and null links with real work when available.
export const profile = { name: 'SUYEON YUN', nameKo: '윤수연', role: 'UI/UX & WEB DESIGNER' };

export const about = {
  statement: ['좋은 디자인은', '복잡한 정보를', '명확한 경험으로', '바꾸는 것이라고 생각합니다.'],
  role: 'UI / WEB DESIGNER',
  introduction: '정보의 흐름을 정리하고, 브랜드의 이야기를 연결하고,\n기억에 남는 경험을 만드는 디자이너입니다.',
  principles: [
    { title: 'UI DESIGN', note: 'CLARITY FIRST', description: '복잡한 정보를 정리하고,\n사용자가 자연스럽게 이해할 수 있는\n화면 구조를 설계합니다.' },
    { title: 'WEB DESIGN', note: 'CHARACTER IN CONTEXT', description: '브랜드의 개성을 유지하면서\n정보와 시각 요소가 자연스럽게 연결되는\n웹 경험을 만듭니다.' },
    { title: 'INTERACTION', note: 'PURPOSEFUL MOTION', description: '단순히 움직임을 추가하는 것이 아니라,\n사용자의 탐색을 돕고 경험을 기억하게 만드는\n인터랙션을 고민합니다.' },
  ],
  tools: ['Figma', 'Photoshop', 'Illustrator', 'HTML / CSS', 'JavaScript'],
};

// Set href to the real mailto: address or profile URL to activate a channel.
// Placeholder channels show an honest availability notice instead of a dead link.
export const contact = {
  description: '좋은 아이디어와 새로운 경험을 함께 만들고 싶습니다.',
  channels: [
    { id: 'email', label: 'Email', display: 'hello@example.com', href: null },
    { id: 'github', label: 'GitHub', display: 'github.com/your-name', href: null },
    { id: 'instagram', label: 'Instagram', display: '@your-name', href: null },
    { id: 'linkedin', label: 'LinkedIn', display: 'linkedin.com/in/your-name', href: null },
  ],
};

export const categories = [
  {
    id: 'redesign', title: 'REDESIGN', label: '익숙한 것의 새로운 가능성',
    description: '익숙한 것을 새로운 시선으로 바라봅니다.\n브랜드의 본질을 발견하고, 더 나은 경험으로 연결합니다.',
    link: '/redesign/',
    projects: [
      { id: 'family-center', title: '가족센터', subtitle: '청주시 가족센터 웹 리디자인', image: '/images/family-center-cover.png', imageFit: 'contain', alt: '청주시 가족센터 웹 리디자인 포트폴리오 표지', year: '—', category: 'Web Redesign', badge: 'WEB REDESIGN', link: '/redesign/family-center' },
      { id: 'tangle', title: 'TANGLE', subtitle: 'A new perspective on everyday wear', image: '/images/tangle.svg', alt: '오렌지 컬러와 대담한 타이포그래피의 TANGLE 패션 웹사이트 콘셉트', year: '2026', category: 'Web · Brand experience', link: null },
      { id: 'monami', title: 'MONAMI', subtitle: 'Every idea starts with a line', image: '/images/monami.svg', alt: '코발트 블루와 펜 그래픽을 사용한 MONAMI 문구 브랜드 웹사이트 콘셉트', year: '2026', category: 'Web · E-commerce', link: null },
    ],
  },
  {
    id: 'project', title: 'PROJECT', label: '작은 질문에서 시작한 경험',
    description: '일상 속 작은 불편함에서 출발합니다.\n문제를 정의하고, 사람을 위한 직관적인 답을 만듭니다.',
    link: null,
    projects: [
      { id: 'orbit', title: 'ORBIT', subtitle: 'A little more space for your day', image: '/images/orbit.svg', alt: '보라색 배경 위 캘린더 모바일 화면을 배치한 ORBIT 일정 관리 앱 콘셉트', year: '2026', category: 'Product · UI/UX', link: null },
      { id: 'common', title: 'COMMON', subtitle: 'Small habits, a greener everyday', image: '/images/common.svg', alt: '초록색 배경과 식물 모티프의 COMMON 습관 관리 앱 콘셉트', year: '2025', category: 'Product · Service design', link: null },
    ],
  },
  {
    id: 'vibe-coding', title: 'VIBE CODING', label: '아이디어를 움직이는 실험',
    description: '디자인과 코드 사이의 가능성을 탐색합니다.\n작은 인터랙션으로 기억에 남는 순간을 만듭니다.',
    link: null,
    projects: [
      { id: 'motion', title: 'MOTION LAB', subtitle: 'Play is part of the process', image: '/images/motion.svg', alt: '라임색 바탕의 인터랙티브 타이포그래피와 커서 실험 콘셉트', year: '2026', category: 'Creative coding · Interaction', link: null },
      { id: 'field', title: 'FIELD NOTES', subtitle: 'An open space for curious minds', image: '/images/field.svg', alt: '파란색 그리드와 기하학적 오브젝트의 웹 인터랙션 실험 콘셉트', year: '2026', category: 'Web · Generative design', link: null },
    ],
  },
];
