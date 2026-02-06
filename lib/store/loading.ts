import { create } from "zustand";

type LoadingType = {
  isVisible: boolean;
  message?: string;
};

interface LoadingState {
  loading: LoadingType;
  setLoading: (loading: LoadingType) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  loading: { isVisible: false, message: "잠시만 기다려주세요..." },
  setLoading: ({ isVisible, message = "잠시만 기다려주세요..." }: LoadingType) =>
    set(() => ({ loading: { isVisible, message } })),
}));

export const loading = {
  show: (message?: string) => useLoadingStore.getState().setLoading({ isVisible: true, message }),
  hide: () => useLoadingStore.getState().setLoading({ isVisible: false }),
};
