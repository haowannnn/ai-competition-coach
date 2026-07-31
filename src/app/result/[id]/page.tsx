import ResultClient from "./ResultClient";

export const dynamic = "force-dynamic";

export default function ResultPage({ params }: { params: { id: string } }) {
  return <ResultClient id={params.id} />;
}
