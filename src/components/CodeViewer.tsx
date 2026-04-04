"use client";

import { useState } from "react";
import { type ExampleSource } from "@/lib/renderers/sources";
import { tokenizeLine } from "@/lib/glslHighlight";

const GITHUB_BASE =
  "https://github.com/coseo12/webgl/blob/main/src/lib/renderers/";

interface CodeViewerProps {
  source: ExampleSource;
}

type Tab = "vertex" | "fragment" | "description";

export default function CodeViewer({ source }: CodeViewerProps) {
  const [tab, setTab] = useState<Tab>("vertex");
  const [fragIndex, setFragIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "vertex", label: "Vertex Shader" },
    { key: "fragment", label: "Fragment Shader" },
    { key: "description", label: "설명" },
  ];

  const currentCode =
    tab === "vertex"
      ? source.vertexShader
      : tab === "fragment"
        ? source.fragmentShaders[fragIndex]?.code ?? ""
        : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {/* 탭 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2.5 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            {/* GitHub 소스 링크 */}
            {source.rendererFile && tab !== "description" && (
              <a
                href={`${GITHUB_BASE}${source.rendererFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                JS 소스
              </a>
            )}
            {/* 복사 버튼 */}
            {tab !== "description" && (
              <button
                onClick={handleCopy}
                className="rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {copied ? "복사됨" : "복사"}
              </button>
            )}
          </div>
        </div>

        {/* Fragment Shader 서브탭 (여러 쉐이더가 있을 때) */}
        {tab === "fragment" && source.fragmentShaders.length > 1 && (
          <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-4 py-1.5 dark:border-gray-700 dark:bg-gray-900">
            {source.fragmentShaders.map((fs, i) => (
              <button
                key={i}
                onClick={() => setFragIndex(i)}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  fragIndex === i
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {fs.label}
              </button>
            ))}
          </div>
        )}

        {/* 코드 영역 */}
        {tab === "description" ? (
          <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
            {source.description}
          </div>
        ) : (
          <div className="max-h-96 overflow-auto bg-gray-950">
            <pre className="p-4">
              <code className="text-sm leading-relaxed">
                {currentCode
                  .trim()
                  .split("\n")
                  .map((line, i) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
