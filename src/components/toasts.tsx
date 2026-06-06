"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastVariant = "error" | "info" | "success";

type ToastInput = {
  message?: string;
  title: string;
  timeoutMs?: number;
  variant?: ToastVariant;
};

type Toast = {
  id: number;
  message?: string;
  title: string;
  timeoutMs: number;
  variant: ToastVariant;
};

type ToastContextValue = {
  dismissToast: (id: number) => void;
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  error: "border-[#744137] bg-[#211715] text-[#f2b3a7]",
  info: "border-[#39454b] bg-[#1e1e26] text-[#28e5e5]",
  success: "border-[#19b4b4] bg-[#16161f] text-[#28e5e5]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const nextToast: Toast = {
      id: Date.now() + Math.random(),
      message: toast.message,
      timeoutMs: toast.timeoutMs ?? 5_000,
      title: toast.title,
      variant: toast.variant ?? "info",
    };

    setToasts((currentToasts) => [...currentToasts.slice(-3), nextToast]);
  }, []);

  const value = useMemo(
    () => ({
      dismissToast,
      pushToast,
    }),
    [dismissToast, pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-20 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6"
      >
        {toasts.map((toast) => (
          <ToastItem
            dismissToast={dismissToast}
            key={toast.id}
            toast={toast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToasts must be used inside ToastProvider.");
  }

  return context;
}

function ToastItem({
  dismissToast,
  toast,
}: {
  dismissToast: (id: number) => void;
  toast: Toast;
}) {
  useEffect(() => {
    if (toast.timeoutMs <= 0) {
      return;
    }

    const timeout = window.setTimeout(
      () => dismissToast(toast.id),
      toast.timeoutMs,
    );

    return () => window.clearTimeout(timeout);
  }, [dismissToast, toast.id, toast.timeoutMs]);

  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)] ${variantStyles[toast.variant]}`}
      role={toast.variant === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm leading-5 text-[#dddddd]/70">
              {toast.message}
            </p>
          ) : null}
        </div>
        <button
          aria-label="Close notification"
          className="rounded px-1.5 text-sm text-current opacity-70 transition hover:bg-white/5 hover:opacity-100"
          onClick={() => dismissToast(toast.id)}
          type="button"
        >
          x
        </button>
      </div>
    </div>
  );
}
