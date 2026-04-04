"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { tokenizeLine } from "@/lib/glslHighlight";

interface ShaderEditorProps {
  vertexShader: string;
  fragmentShader: string;
}

// 풀스크린 쿼드 렌더링용 기본 vertex shader
const DEFAULT_VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * 셰이더를 직접 편집하고 실시간으로 결과를 확인할 수 있는 에디터
 */
export default function ShaderEditor({
  vertexShader,
  fragmentShader,
}: ShaderEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const programRef = useRef<WebGLProgram | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const startTimeRef = useRef(0);

  const [vert, setVert] = useState(vertexShader);
  const [frag, setFrag] = useState(fragmentShader);
  const [activeTab, setActiveTab] = useState<"vertex" | "fragment">("fragment");
  const [error, setError] = useState<string | null>(null);

  // 셰이더 컴파일 시도
  const tryCompile = useCallback(
    (gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null => {
      const vs = gl.createShader(gl.VERTEX_SHADER);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vs || !fs) return null;

      gl.shaderSource(vs, vertSrc);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        setError(`Vertex: ${gl.getShaderInfoLog(vs)}`);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return null;
      }

      gl.shaderSource(fs, fragSrc);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        setError(`Fragment: ${gl.getShaderInfoLog(fs)}`);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return null;
      }

      const program = gl.createProgram();
      if (!program) return null;

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      gl.deleteShader(vs);
      gl.deleteShader(fs);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        setError(`Link: ${gl.getProgramInfoLog(program)}`);
        gl.deleteProgram(program);
        return null;
      }

      setError(null);
      return program;
    },
    []
  );

  // 셰이더 변경 시 재컴파일
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    const newProgram = tryCompile(gl, vert, frag);
    if (newProgram) {
      if (programRef.current) gl.deleteProgram(programRef.current);
      programRef.current = newProgram;
    }
  }, [vert, frag, tryCompile]);

  // WebGL 초기화 + 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;
    glRef.current = gl;

    // 풀스크린 쿼드 버퍼
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // 초기 컴파일
    const program = tryCompile(gl, vert, frag);
    if (program) programRef.current = program;

    startTimeRef.current = performance.now();

    const loop = () => {
      const prog = programRef.current;
      if (!prog) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(prog);

      // 공통 uniform 바인딩
      const uTime = gl.getUniformLocation(prog, "u_time");
      const uResolution = gl.getUniformLocation(prog, "u_resolution");
      if (uTime) gl.uniform1f(uTime, (performance.now() - startTimeRef.current) / 1000);
      if (uResolution) gl.uniform2f(uResolution, canvas.width, canvas.height);

      const aPos = gl.getAttribLocation(prog, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (programRef.current) gl.deleteProgram(programRef.current);
      gl.deleteBuffer(buffer);
      programRef.current = null;
      glRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCode = activeTab === "vertex" ? vert : frag;
  const setCurrentCode = activeTab === "vertex" ? setVert : setFrag;

  const handleReset = () => {
    setVert(vertexShader);
    setFrag(fragmentShader);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {/* 캔버스 */}
      <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <span className="font-semibold">컴파일 에러: </span>
          <span className="whitespace-pre-wrap font-mono">{error}</span>
        </div>
      )}

      {/* 에디터 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {/* 탭 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex">
            <button
              onClick={() => setActiveTab("vertex")}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "vertex"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Vertex Shader
            </button>
            <button
              onClick={() => setActiveTab("fragment")}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "fragment"
                  ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Fragment Shader
            </button>
          </div>
          <button
            onClick={handleReset}
            className="rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            원본 복원
          </button>
        </div>

        {/* 코드 에디터 영역 */}
        <div className="relative max-h-80 overflow-auto bg-gray-950">
          {/* 하이라이팅 오버레이 (읽기 전용) */}
          <pre className="pointer-events-none absolute inset-0 p-4" aria-hidden>
            <code className="text-sm leading-relaxed">
              {currentCode.split("\n").map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 inline-block w-8 text-right text-gray-600 select-none">
                    {i + 1}
                  </span>
                  <span>
                    {tokenizeLine(line).map((token, j) => (
                      <span key={j} className={token.className}>
                        {token.text}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </code>
          </pre>

          {/* 실제 textarea (투명 텍스트, 편집용) */}
          <textarea
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            spellCheck={false}
            className="relative w-full resize-none bg-transparent p-4 pl-16 font-mono text-sm leading-relaxed text-transparent caret-white outline-none"
            style={{ minHeight: "200px" }}
            rows={currentCode.split("\n").length + 2}
          />
        </div>
      </div>

      {/* 힌트 */}
      <p className="text-xs text-gray-500 dark:text-gray-500">
        셰이더 코드를 수정하면 실시간으로 반영됩니다. u_time(초), u_resolution(해상도) uniform을 사용할 수 있습니다.
      </p>
    </div>
  );
}
