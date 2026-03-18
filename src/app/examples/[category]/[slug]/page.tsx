import { notFound } from "next/navigation";
import { categories, findExample } from "@/lib/examples";
import ExampleViewer from "@/components/ExampleViewer";

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

  return (
    <ExampleViewer category={result.category} example={result.example} />
  );
}
