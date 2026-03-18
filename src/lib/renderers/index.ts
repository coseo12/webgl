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
import { createMarblingRenderer } from "./marbling";
import { createFallingSandRenderer } from "./fallingSand";
import { createMandelbulbRenderer } from "./mandelbulb";
import { createCircleRenderer } from "./circle";
import { createBlendingRenderer } from "./blending";
import { createCombinedRenderer } from "./combined";
import { createSpecularRenderer } from "./specular";
import { createPointLightRenderer } from "./pointLight";
import { createMultiTextureRenderer } from "./multiTexture";
import { createTextureWrappingRenderer } from "./textureWrapping";

/** 예제 slug → 렌더러 팩토리 매핑 */
const rendererMap: Record<string, RendererFactory> = {
  triangle: createTriangleRenderer,
  rectangle: createRectangleRenderer,
  colors: createColorsRenderer,
  circle: createCircleRenderer,
  blending: createBlendingRenderer,
  translation: createTranslationRenderer,
  rotation: createRotationRenderer,
  scale: createScaleRenderer,
  combined: createCombinedRenderer,
  ambient: createAmbientRenderer,
  diffuse: createDiffuseRenderer,
  specular: createSpecularRenderer,
  "point-light": createPointLightRenderer,
  "basic-texture": createBasicTextureRenderer,
  "multi-texture": createMultiTextureRenderer,
  "texture-wrapping": createTextureWrappingRenderer,
  shader: createShaderRenderer,
  particles: createParticlesRenderer,
  "solar-system": createSolarSystemRenderer,
  marbling: createMarblingRenderer,
  "falling-sand": createFallingSandRenderer,
  mandelbulb: createMandelbulbRenderer,
};

export function getRendererFactory(slug: string): RendererFactory | null {
  return rendererMap[slug] ?? null;
}
