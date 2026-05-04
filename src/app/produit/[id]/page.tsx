import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientProductPage id={id} />;
}