"use client";

import { type Param, type ParamValues, getDefaultValues } from "@/lib/params";

interface ControlPanelProps {
  params: Param[];
  values: ParamValues;
  onChange: (key: string, value: number | string | boolean) => void;
}

export default function ControlPanel({
  params,
  values,
  onChange,
}: ControlPanelProps) {
  if (params.length === 0) return null;

  const handleReset = () => {
    const defaults = getDefaultValues(params);
    for (const [key, value] of Object.entries(defaults)) {
      onChange(key, value);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Controls
        </h3>
        <button
          onClick={handleReset}
          className="rounded-md px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          리셋
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {params.map((param) => (
          <div key={param.key}>
            {param.type === "slider" && (
              <label className="block">
                <span className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{param.label}</span>
                  <span className="font-mono">
                    {values[param.key] as number}
                  </span>
                </span>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={values[param.key] as number}
                  onChange={(e) =>
                    onChange(param.key, parseFloat(e.target.value))
                  }
                  className="w-full accent-blue-600"
                />
              </label>
            )}

            {param.type === "color" && (
              <label className="flex items-center gap-2">
                <input
                  type="color"
                  value={values[param.key] as string}
                  onChange={(e) => onChange(param.key, e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {param.label}
                </span>
              </label>
            )}

            {param.type === "checkbox" && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={values[param.key] as boolean}
                  onChange={(e) => onChange(param.key, e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {param.label}
                </span>
              </label>
            )}

            {param.type === "select" && (
              <label className="block">
                <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                  {param.label}
                </span>
                <select
                  value={values[param.key] as string}
                  onChange={(e) => onChange(param.key, e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  {param.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
