import { Suspense } from "react";
import DirectoryClient from "./DirectoryClient";

export const dynamic = "force-dynamic";

export default function DirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-base font-medium text-slate-600">Loading directory...</p>
        </div>
      }
    >
      <DirectoryClient />
    </Suspense>
  );
}