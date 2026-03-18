import { type ParamValues } from "@/lib/params";

/** 각 예제 렌더러가 구현해야 하는 인터페이스 */
export interface Renderer {
  /** 매 프레임 또는 파라미터 변경 시 호출 */
  render: (time: number, params: ParamValues) => void;
  /** 정리 (WebGL 리소스 해제) */
  cleanup: () => void;
}

export type RendererFactory = (
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
) => Renderer;
