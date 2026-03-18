import Link from "next/link";
import { categories } from "@/lib/examples";

export default function Home() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        WebGL Examples
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        다양한 WebGL 예제를 탐색하고 실행해보세요.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.slug}
            className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
          >
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {category.title}
            </h2>
            <ul className="space-y-1.5">
              {category.examples.map((example) => (
                <li key={example.slug}>
                  <Link
                    href={`/examples/${category.slug}/${example.slug}`}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {example.title}
                  </Link>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                    {example.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
