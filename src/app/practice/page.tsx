import { Suspense } from "react";
import PracticeClient from "./PracticeClient";

export const dynamic = "force-dynamic";

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeClient />
    </Suspense>
  );
}
