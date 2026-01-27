"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/shared/Spinner";
import { loadingStore } from "@/lib/loading";

export function LoadingOverlay() {
  const [state, setState] = useState(loadingStore.getState());

  useEffect(() => {
    const unsubscribe = loadingStore.subscribe(setState);
    // 구독 후 현재 상태를 다시 확인 (구독 전에 변경된 상태를 캐치)
    setState(loadingStore.getState());
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log("LoadingOverlay state:", state);
  }, [state]);

  if (!state.isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/0 backdrop-blur-[1.5px]">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-6 shadow-lg">
        <Spinner variant="ellipsis" />
        <p className="font-medium text-sm">{state.message}</p>
      </div>
    </div>
  );
}
