"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { alert as alertActions, useAlertStore } from "@/lib/store/alert";

export function Alert() {
  const { alert } = useAlertStore();

  const handleConfirm = () => {
    alert.onConfirm?.();
    alertActions.close();
  };

  const handleCancel = () => {
    alert.onCancel?.();
    alertActions.close();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  if (!alert.open) return null;

  return (
    <AlertDialog open={alert.open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alert.title}</AlertDialogTitle>
          <AlertDialogDescription>{alert.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {alert.type === "confirm" && (
            <AlertDialogCancel onClick={handleCancel}>{alert.cancelText}</AlertDialogCancel>
          )}
          <AlertDialogAction onClick={handleConfirm}>{alert.confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
