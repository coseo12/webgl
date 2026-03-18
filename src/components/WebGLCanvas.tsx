"use client";

import { useEffect, useRef } from "react";
import { type Renderer } from "@/lib/renderers/types";
import { type ParamValues } from "@/lib/params";
import { getRendererFactory } from "@/lib/renderers";

interface WebGLCanvasProps {
  slug: string;
  params: ParamValues;
}

export default function WebGLCanvas({ slug, params }: WebGLCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number>(0);
  const paramsRef = useRef<ParamValues>(params);

  // 파라미터 변경 시 ref 업데이트 (렌더 루프에서 참조)
  paramsRef.current = params;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const factory = getRendererFactory(slug);
    if (!factory) return;

    const renderer = factory(gl, canvas);
    rendererRef.current = renderer;

    const loop = (time: number) => {
      renderer.render(time, paramsRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.cleanup();
      rendererRef.current = null;
    };
  }, [slug]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-xl"
    />
  );
}
