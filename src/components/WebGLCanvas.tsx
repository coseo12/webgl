"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { type Renderer } from "@/lib/renderers/types";
import { type ParamValues } from "@/lib/params";
import { getRendererFactory } from "@/lib/renderers";

interface WebGLCanvasProps {
  slug: string;
  params: ParamValues;
}

export interface WebGLCanvasHandle {
  pause: () => void;
  resume: () => void;
  reset: () => void;
  isPaused: () => boolean;
}

const WebGLCanvas = forwardRef<WebGLCanvasHandle, WebGLCanvasProps>(
  function WebGLCanvas({ slug, params }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const rafRef = useRef<number>(0);
    const paramsRef = useRef<ParamValues>(params);
    const pausedRef = useRef(false);
    // 일시정지 시점의 시간을 저장해 resume 시 오프셋 보정
    const timeOffsetRef = useRef(0);
    const pausedAtRef = useRef(0);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const factoryRef = useRef<ReturnType<typeof getRendererFactory>>(null);

    paramsRef.current = params;

    const startLoop = useCallback(() => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      const loop = (time: number) => {
        if (pausedRef.current) return;
        renderer.render(time - timeOffsetRef.current, paramsRef.current);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }, []);

    useImperativeHandle(ref, () => ({
      pause() {
        if (pausedRef.current) return;
        pausedRef.current = true;
        cancelAnimationFrame(rafRef.current);
        pausedAtRef.current = performance.now();
      },
      resume() {
        if (!pausedRef.current) return;
        pausedRef.current = false;
        // 일시정지 동안 흐른 시간을 오프셋에 누적
        timeOffsetRef.current += performance.now() - pausedAtRef.current;
        startLoop();
      },
      reset() {
        // 렌더러 재생성
        const gl = glRef.current;
        const canvas = canvasRef.current;
        const factory = factoryRef.current;
        if (!gl || !canvas || !factory) return;

        cancelAnimationFrame(rafRef.current);
        rendererRef.current?.cleanup();

        const renderer = factory(gl, canvas);
        rendererRef.current = renderer;
        timeOffsetRef.current = 0;
        pausedRef.current = false;
        startLoop();
      },
      isPaused() {
        return pausedRef.current;
      },
    }), [startLoop]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext("webgl");
      if (!gl) return;

      const factory = getRendererFactory(slug);
      if (!factory) return;

      glRef.current = gl;
      factoryRef.current = factory;

      const renderer = factory(gl, canvas);
      rendererRef.current = renderer;
      pausedRef.current = false;
      timeOffsetRef.current = 0;

      startLoop();

      return () => {
        cancelAnimationFrame(rafRef.current);
        renderer.cleanup();
        rendererRef.current = null;
      };
    }, [slug, startLoop]);

    return (
      <canvas
        ref={canvasRef}
        className="h-full w-full rounded-xl"
      />
    );
  }
);

export default WebGLCanvas;
