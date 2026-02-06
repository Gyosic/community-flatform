import { ReactNode } from "react";
import { create } from "zustand";

type AlertType = "confirm" | "alert";

type AlertState = {
  open: boolean;
  type: AlertType;
  title: ReactNode;
  message: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

interface AlertStore {
  alert: AlertState;
  setAlert: (alert: Partial<AlertState>) => void;
  reset: () => void;
}

const defaultState: AlertState = {
  open: false,
  type: "alert",
  title: "",
  message: "",
  confirmText: "확인",
  cancelText: "취소",
  onConfirm: undefined,
  onCancel: undefined,
};

export const useAlertStore = create<AlertStore>((set) => ({
  alert: { ...defaultState },
  setAlert: (newAlert) => set((state) => ({ alert: { ...state.alert, ...newAlert } })),
  reset: () => set({ alert: { ...defaultState } }),
}));

type ConfirmOptions = {
  title?: ReactNode;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertOptions = {
  title?: ReactNode;
  message: ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
};

export const alert = {
  confirm: (options: ConfirmOptions) => {
    useAlertStore.getState().setAlert({
      open: true,
      type: "confirm",
      title: options?.title ?? "확인",
      message: options.message,
      confirmText: options.confirmText || "확인",
      cancelText: options.cancelText || "취소",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  },

  show: (options: AlertOptions) => {
    useAlertStore.getState().setAlert({
      open: true,
      type: "alert",
      title: options?.title || "알림",
      message: options.message,
      confirmText: options.confirmText || "확인",
      onConfirm: options.onConfirm,
    });
  },

  close: () => {
    useAlertStore.getState().reset();
  },
};
