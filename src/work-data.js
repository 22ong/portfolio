import { categories } from './data.js';

// Listing metadata is independent of the main page's automatic showreel.
// Shared images, titles and years come from the existing project records.
const redesignProjects = categories.find((category) => category.id === 'redesign').projects;
function listingProject(id, number, description) {
  const project = redesignProjects.find((item) => item.id === id);
  return {
    id,
    number,
    title: project.title,
    category: project.category,
    year: project.year,
    description,
    thumbnail: project.image,
    alt: project.alt,
    link: `/redesign/${id}/`,
  };
}

export const redesign = {
  number: '01',
  title: 'REDESIGN',
  description: '기존 브랜드의 문제를 발견하고,\n브랜드의 개성과 사용자 경험을 고려해 새로운 웹 경험으로 재구성한 프로젝트입니다.',
  projects: [
    {
      id: 'family-center',
      number: '01',
      title: '가족센터',
      category: 'Web Redesign',
      year: '—', // Replace when the project year is supplied.
      description: '프로젝트 소개는 곧 업데이트됩니다.',
      thumbnail: '/images/family-center.svg', // Replace with the actual thumbnail.
      alt: '가족센터 웹 리디자인 프로젝트의 임시 대표 이미지',
      link: '/redesign/family-center',
    },
    listingProject('tangle', '02', '브랜드의 개성을 화면에 담고,\n탐색의 흐름을 새롭게 정리한 웹 리디자인.'),
    listingProject('monami', '03', '익숙한 일상의 도구를 새로운 시선으로.\n브랜드의 이야기와 제품 탐색을 연결한 웹 리디자인.'),
  ],
};
