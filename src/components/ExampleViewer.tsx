"use client";

import { useState } from "react";
import WebGLCanvas from "./WebGLCanvas";
import CodeViewer from "./CodeViewer";
import ControlPanel from "./ControlPanel";
import { type Category, type Example } from "@/lib/examples";
import { type ParamValues, getDefaultValues } from "@/lib/params";
import { getExampleSource } from "@/lib/renderers/sources";

type ViewTab = "canvas" | "code";

interface ExampleViewerProps {
  category: Category;
  example: Example;
}

export default function ExampleViewer({
  category,
  example,
}: ExampleViewerProps) {
  const params = example.params ?? [];
  const [values, setValues] = useState<ParamValues>(() =>
    getDefaultValues(params)
  );
  const [viewTab, setViewTab] = useState<ViewTab>("canvas");

  const source = getExampleSource(example.slug);

  const handleChange = (key: string, value: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

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
      </div>

      {/* 콘텐츠 영역 */}
      {viewTab === "canvas" ? (
        <>
          <div className="mx-auto max-w-3xl">
            <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700">
              <WebGLCanvas slug={example.slug} params={values} />
            </div>
          </div>
          <ControlPanel
            params={params}
            values={values}
            onChange={handleChange}
          />
        </>
      ) : (
        source && <CodeViewer source={source} />
      )}
    </div>
  );
}
