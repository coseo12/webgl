import { type RendererFactory } from "./types";
import { createTriangleRenderer } from "./triangle";
import { createRectangleRenderer } from "./rectangle";
import { createColorsRenderer } from "./colors";
import { createTranslationRenderer } from "./translation";
import { createRotationRenderer } from "./rotation";
import { createScaleRenderer } from "./scale";
import { createAmbientRenderer } from "./ambient";
import { createDiffuseRenderer } from "./diffuse";
import { createBasicTextureRenderer } from "./basicTexture";
import { createShaderRenderer } from "./shader";
import { createParticlesRenderer } from "./particles";
import { createSolarSystemRenderer } from "./solarSystem";

/** 예제 slug → 렌더러 팩토리 매핑 */
const rendererMap: Record<string, RendererFactory> = {
  triangle: createTriangleRenderer,
  rectangle: createRectangleRenderer,
  colors: createColorsRenderer,
  translation: createTranslationRenderer,
  rotation: createRotationRenderer,
  scale: createScaleRenderer,
  ambient: createAmbientRenderer,
  diffuse: createDiffuseRenderer,
  "basic-texture": createBasicTextureRenderer,
  shader: createShaderRenderer,
  particles: createParticlesRenderer,
  "solar-system": createSolarSystemRenderer,
};

export function getRendererFactory(slug: string): RendererFactory | null {
  return rendererMap[slug] ?? null;
}
