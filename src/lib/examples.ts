import { type Param } from "./params";

export interface Example {
  slug: string;
  title: string;
  description: string;
  params?: Param[];
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
        params: [
          {
            type: "color",
            label: "배경색",
            key: "bgColor",
            defaultValue: "#000000",
          },
        ],
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
        params: [
          {
            type: "slider",
            label: "회전 속도",
            key: "speed",
            min: 0,
            max: 10,
            step: 0.1,
            defaultValue: 1,
          },
          {
            type: "checkbox",
            label: "자동 회전",
            key: "autoRotate",
            defaultValue: true,
          },
        ],
      },
      {
        slug: "scale",
        title: "스케일",
        description: "오브젝트 크기 변환(Scale)",
        params: [
          {
            type: "slider",
            label: "크기",
            key: "scale",
            min: 0.1,
            max: 3,
            step: 0.1,
            defaultValue: 1,
          },
        ],
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
        params: [
          {
            type: "select",
            label: "쉐이더 타입",
            key: "shaderType",
            options: [
              { label: "기본", value: "default" },
              { label: "그라데이션", value: "gradient" },
              { label: "노이즈", value: "noise" },
            ],
            defaultValue: "default",
          },
        ],
      },
      {
        slug: "particles",
        title: "파티클",
        description: "파티클 시스템 구현",
      },
    ],
  },
  {
    slug: "simulation",
    title: "Simulation",
    examples: [
      {
        slug: "solar-system",
        title: "솔라시스템",
        description: "태양계 행성 공전/자전 시뮬레이션과 궤도 카메라 시점 제어",
        params: [
          {
            type: "slider",
            label: "공전 속도",
            key: "speed",
            min: 0,
            max: 5,
            step: 0.1,
            defaultValue: 1,
          },
          {
            type: "checkbox",
            label: "궤도 표시",
            key: "showOrbits",
            defaultValue: true,
          },
          {
            type: "checkbox",
            label: "자동 회전",
            key: "autoRotate",
            defaultValue: false,
          },
        ],
      },
      {
        slug: "marbling",
        title: "마블링",
        description:
          "Mathematical Marbling 기반 유체 마블링 — 잉크 드롭, 빗 끌기, 소용돌이",
        params: [
          {
            type: "select",
            label: "도구",
            key: "tool",
            options: [
              { label: "잉크 드롭", value: "drop" },
              { label: "빗 (Tine)", value: "tine" },
              { label: "소용돌이", value: "swirl" },
            ],
            defaultValue: "drop",
          },
          {
            type: "color",
            label: "잉크 색상",
            key: "inkColor",
            defaultValue: "#E63946",
          },
          {
            type: "slider",
            label: "반지름",
            key: "radius",
            min: 0.02,
            max: 0.2,
            step: 0.01,
            defaultValue: 0.08,
          },
          {
            type: "slider",
            label: "강도",
            key: "strength",
            min: 1,
            max: 10,
            step: 0.5,
            defaultValue: 3,
          },
        ],
      },
      {
        slug: "falling-sand",
        title: "낙하 모래",
        description:
          "셀룰러 오토마타 기반 모래 시뮬레이션 — 중력 낙하, 쌓임, 다양한 색상",
        params: [
          {
            type: "color",
            label: "모래 색상",
            key: "sandColor",
            defaultValue: "#E8A530",
          },
          {
            type: "slider",
            label: "브러시 크기",
            key: "brushSize",
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 3,
          },
          {
            type: "slider",
            label: "시뮬레이션 속도",
            key: "speed",
            min: 1,
            max: 5,
            step: 1,
            defaultValue: 2,
          },
          {
            type: "checkbox",
            label: "무지개 모드",
            key: "rainbow",
            defaultValue: false,
          },
        ],
      },
      {
        slug: "mandelbulb",
        title: "만델벌브",
        description:
          "Mandelbulb 3D 프랙탈 — 레이마칭, Power 조절, Orbit Trap 색상",
        params: [
          {
            type: "slider",
            label: "Power",
            key: "power",
            min: 2,
            max: 12,
            step: 0.5,
            defaultValue: 8,
          },
          {
            type: "slider",
            label: "반복 횟수",
            key: "iterations",
            min: 4,
            max: 16,
            step: 1,
            defaultValue: 8,
          },
          {
            type: "select",
            label: "색상 테마",
            key: "colorScheme",
            options: [
              { label: "클래식", value: "classic" },
              { label: "웜톤", value: "warm" },
              { label: "쿨톤", value: "cool" },
              { label: "사이키델릭", value: "psychedelic" },
            ],
            defaultValue: "classic",
          },
          {
            type: "checkbox",
            label: "자동 회전",
            key: "autoRotate",
            defaultValue: true,
          },
        ],
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
