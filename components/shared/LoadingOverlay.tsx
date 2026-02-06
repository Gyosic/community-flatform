"use client";

import { Spinner } from "@/components/shared/Spinner";
import { useLoadingStore } from "@/lib/store/loading";

export function LoadingOverlay() {
  const { loading: { isVisible, message } = {} } = useLoadingStore((state) => state);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/0 backdrop-blur-[1.5px]">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-lg">
        <Spinner variant="ellipsis" />
        <p className="font-medium text-sm">{message}</p>
      </div>
    </div>
  );
}
