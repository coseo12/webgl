export interface Example {
  slug: string;
  title: string;
  description: string;
}

export interface Category {
  slug: string;
  title: string;
  examples: Example[];
}

export const categories: Category[] = [
  {
    slug: "basic",
    title: "Basic",
    examples: [
      {
        slug: "triangle",
        title: "삼각형",
        description: "WebGL로 그리는 첫 번째 삼각형",
      },
      {
        slug: "rectangle",
        title: "사각형",
        description: "두 개의 삼각형으로 사각형 그리기",
      },
      {
        slug: "colors",
        title: "색상",
        description: "버텍스 컬러를 이용한 그라데이션",
      },
    ],
  },
  {
    slug: "transformation",
    title: "Transformation",
    examples: [
      {
        slug: "translation",
        title: "이동",
        description: "오브젝트 이동(Translation)",
      },
      {
        slug: "rotation",
        title: "회전",
        description: "오브젝트 회전(Rotation)",
      },
      {
        slug: "scale",
        title: "스케일",
        description: "오브젝트 크기 변환(Scale)",
      },
    ],
  },
  {
    slug: "lighting",
    title: "Lighting",
    examples: [
      {
        slug: "ambient",
        title: "앰비언트",
        description: "주변광(Ambient Light) 적용",
      },
      {
        slug: "diffuse",
        title: "디퓨즈",
        description: "확산광(Diffuse Light) 적용",
      },
    ],
  },
  {
    slug: "texture",
    title: "Texture",
    examples: [
      {
        slug: "basic-texture",
        title: "기본 텍스처",
        description: "이미지 텍스처 매핑",
      },
    ],
  },
  {
    slug: "advanced",
    title: "Advanced",
    examples: [
      {
        slug: "shader",
        title: "커스텀 쉐이더",
        description: "GLSL 쉐이더 프로그래밍",
      },
      {
        slug: "particles",
        title: "파티클",
        description: "파티클 시스템 구현",
      },
    ],
  },
];

export function findExample(
  categorySlug: string,
  exampleSlug: string
): { category: Category; example: Example } | null {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return null;

  const example = category.examples.find((e) => e.slug === exampleSlug);
  if (!example) return null;

  return { category, example };
}
