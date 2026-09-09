import { RaceClient } from "@/components/RaceClient";

type RacePageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function RacePage({ searchParams }: RacePageProps) {
  const params = await searchParams;
  const initialCode = (params.code ?? "").trim().toUpperCase();
  return <RaceClient initialCode={initialCode} />;
}
