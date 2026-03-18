"use client";

import { useState } from "react";
import WebGLCanvas from "./WebGLCanvas";
import ControlPanel from "./ControlPanel";
import { type Category, type Example } from "@/lib/examples";
import { type ParamValues, getDefaultValues } from "@/lib/params";

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

  const handleChange = (key: string, value: number | string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* 예제 정보 */}
      <div className="mb-6">
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

      {/* WebGL 캔버스 영역 */}
      <div className="mx-auto max-w-3xl">
        <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700">
          <WebGLCanvas slug={example.slug} params={values} />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel params={params} values={values} onChange={handleChange} />
    </div>
  );
}
