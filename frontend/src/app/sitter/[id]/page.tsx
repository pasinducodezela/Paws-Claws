import { notFound } from "next/navigation";
import SitterProfileClient from "./SitterProfileClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function SitterProfilePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  return <SitterProfileClient id={id} />;
}
