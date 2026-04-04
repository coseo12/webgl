"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import WebGLCanvas, { type WebGLCanvasHandle } from "./WebGLCanvas";
import CodeViewer from "./CodeViewer";
import ShaderEditor from "./ShaderEditor";
import ControlPanel from "./ControlPanel";
import { type Category, type Example } from "@/lib/examples";
import { type Param, type ParamValues, getDefaultValues } from "@/lib/params";
import { getExampleSource } from "@/lib/renderers/sources";

type ViewTab = "canvas" | "code" | "edit";

interface ExampleViewerProps {
  category: Category;
  example: Example;
}

export default function ExampleViewer({
  category,
  example,
}: ExampleViewerProps) {
  const params = example.params ?? [];
  const [values, setValues] = useState<ParamValues>(() => {
    const defaults = getDefaultValues(params);
    // URL 쿼리 스트링에서 파라미터 초기값 복원
    if (typeof window === "undefined") return defaults;
    const search = new URLSearchParams(window.location.search);
    for (const p of params) {
      const v = search.get(p.key);
      if (v === null) continue;
      if (p.type === "slider") defaults[p.key] = parseFloat(v);
      else if (p.type === "checkbox") defaults[p.key] = v === "true";
      else defaults[p.key] = v;
    }
    return defaults;
  });
  const [viewTab, setViewTab] = useState<ViewTab>("canvas");
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const canvasHandleRef = useRef<WebGLCanvasHandle>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  const source = getExampleSource(example.slug);

  const handleChange = (key: string, value: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // 파라미터 변경 시 URL 쿼리 스트링 동기화
  useEffect(() => {
    if (params.length === 0) return;
    const defaults = getDefaultValues(params);
    const search = new URLSearchParams();
    let hasNonDefault = false;
    for (const p of params) {
      if (values[p.key] !== defaults[p.key]) {
        search.set(p.key, String(values[p.key]));
        hasNonDefault = true;
      }
    }
    const url = hasNonDefault
      ? `${window.location.pathname}?${search.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [values, params]);

  const handlePlayPause = useCallback(() => {
    const handle = canvasHandleRef.current;
    if (!handle) return;
    if (handle.isPaused()) {
      handle.resume();
      setPaused(false);
    } else {
      handle.pause();
      setPaused(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    canvasHandleRef.current?.reset();
    setPaused(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  // 풀스크린 상태 동기화
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div>
      {/* 예제 정보 */}
      <div className="mb-4">
        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
          {category.title}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {example.title}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {example.description}
        </p>
      </div>

      {/* Canvas / Code 탭 전환 */}
      <div className="mx-auto mb-3 flex max-w-3xl gap-1">
        <button
          onClick={() => setViewTab("canvas")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewTab === "canvas"
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          Canvas
        </button>
        <button
          onClick={() => setViewTab("code")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            viewTab === "code"
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          Code
        </button>
        {source && (
          <button
            onClick={() => setViewTab("edit")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewTab === "edit"
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Edit
          </button>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      {viewTab === "canvas" ? (
        <>
          <div className="mx-auto max-w-3xl">
            <div
              ref={canvasWrapperRef}
              className="relative aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700"
            >
              <WebGLCanvas
                ref={canvasHandleRef}
                slug={example.slug}
                params={values}
                timeScale={timeScale}
              />

              {/* 속도 컨트롤 */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/50 px-2.5 py-1.5 backdrop-blur-sm">
                <span className="text-xs font-mono text-white/70">{timeScale.toFixed(1)}x</span>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={0.1}
                  value={timeScale}
                  onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                  className="h-1 w-16 cursor-pointer accent-white"
                />
              </div>

              {/* 캔버스 오버레이 컨트롤 */}
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                {/* 재생/정지 */}
                <button
                  onClick={handlePlayPause}
                  className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  title={paused ? "재생" : "정지"}
                >
                  {paused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                    </svg>
                  )}
                </button>

                {/* 리셋 */}
                <button
                  onClick={handleReset}
                  className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  title="리셋"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H4.598a.75.75 0 00-.75.75v3.634a.75.75 0 001.5 0v-2.033l.364.363a7 7 0 0011.712-3.138.75.75 0 00-1.112-.231zm-10.624-2.85a5.5 5.5 0 019.201-2.465l.312.31H11.768a.75.75 0 000 1.5h3.634a.75.75 0 00.75-.75V3.535a.75.75 0 00-1.5 0v2.033l-.364-.363A7 7 0 002.576 8.344a.75.75 0 001.112.23z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* 풀스크린 */}
                <button
                  onClick={handleFullscreen}
                  className="rounded-lg bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  title={isFullscreen ? "풀스크린 해제" : "풀스크린"}
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06L5.44 6.5H2.75a.75.75 0 000 1.5h4.5A.75.75 0 008 7.25v-4.5a.75.75 0 00-1.5 0v2.69L3.28 2.22zM16.72 2.22a.75.75 0 010 1.06L13.56 6.5h2.69a.75.75 0 010 1.5h-4.5A.75.75 0 0111 7.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 0zM3.28 17.78a.75.75 0 001.06 0L7.56 14.5H4.87a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-2.69l-3.22 3.22a.75.75 0 01-1.06-1.06zM16.72 17.78a.75.75 0 01-1.06 0L12.44 14.5h2.69a.75.75 0 010-1.5h-4.5a.75.75 0 01-.75.75v4.5a.75.75 0 001.5 0v-2.69l3.22 3.22a.75.75 0 001.06-1.06z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.69l-3.22 3.22a.75.75 0 001.06 1.06zM2 17.25v-4.5a.75.75 0 011.5 0v2.69l3.22-3.22a.75.75 0 011.06 1.06L4.56 16.5h2.69a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM2 2.75v4.5a.75.75 0 001.5 0V4.56l3.22 3.22a.75.75 0 001.06-1.06L4.56 3.5h2.69a.75.75 0 000-1.5h-4.5a.75.75 0 00-.75.75zM18 17.25v-4.5a.75.75 0 00-1.5 0v2.69l-3.22-3.22a.75.75 0 00-1.06 1.06l3.22 3.22h-2.69a.75.75 0 000 1.5h4.5a.75.75 0 00.75-.75z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <ControlPanel
            params={params}
            values={values}
            onChange={handleChange}
          />
        </>
      ) : viewTab === "code" ? (
        source && <CodeViewer source={source} />
      ) : (
        source && (
          <ShaderEditor
            vertexShader={source.vertexShader}
            fragmentShader={source.fragmentShaders[0]?.code ?? ""}
          />
        )
      )}
    </div>
  );
}
