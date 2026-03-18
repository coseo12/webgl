import { notFound } from "next/navigation";
import { categories, findExample } from "@/lib/examples";

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.examples.map((example) => ({
      category: category.slug,
      slug: example.slug,
    }))
  );
}

export default async function ExamplePage({ params }: PageProps) {
  const { category, slug } = await params;
  const result = findExample(category, slug);

  if (!result) notFound();

  const { category: cat, example } = result;

  return (
    <div>
      {/* 예제 정보 */}
      <div className="mb-6">
        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
          {cat.title}
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
        <div className="flex aspect-video items-center justify-center rounded-xl border border-gray-200 bg-gray-900 dark:border-gray-700">
          <p className="text-sm text-gray-500">WebGL Canvas</p>
        </div>
      </div>
    </div>
  );
}
