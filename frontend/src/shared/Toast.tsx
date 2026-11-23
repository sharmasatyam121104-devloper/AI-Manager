import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  Info,
  Loader2,
  X,
} from "lucide-react";
import styles from "./Toast.module.css";
import { cx } from "./utils";
import { toast, useToasts, type ToastItem, type ToastType } from "./toastStore";

export type ToastTheme = "light" | "dark";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

const positionClasses: Record<ToastPosition, string | undefined> = {
  "top-right": styles.topRight,
  "top-left": styles.topLeft,
  "top-center": styles.topCenter,
  "bottom-right": styles.bottomRight,
  "bottom-left": styles.bottomLeft,
  "bottom-center": styles.bottomCenter,
};

const typeClasses: Record<ToastType, string | undefined> = {
  info: styles.typeInfo,
  success: styles.typeSuccess,
  warning: styles.typeWarning,
  error: styles.typeError,
  loading: styles.typeLoading,
};

function ToastIcon({ type }: { type: ToastType }) {
  const common = { size: 16, "aria-hidden": true as const };

  switch (type) {
    case "success":
      return <CheckCircle2 {...common} />;
    case "warning":
      return <AlertTriangle {...common} />;
    case "error":
      return <CircleX {...common} />;
    case "loading":
      return <Loader2 {...common} className={styles.spin} />;
    default:
      return <Info {...common} />;
  }
}

interface ToastCardProps {
  item: ToastItem;
}

function ToastCard({ item }: ToastCardProps) {
  const { id, type, title, description, closing } = item;

  useEffect(() => {
    if (closing || type === "loading") return;
    const duration = item.duration ?? 5000;
    const timer = window.setTimeout(() => toast.dismiss(id), duration);
    return () => window.clearTimeout(timer);
  }, [id, type, closing, item.duration]);

  return (
    <div
      className={cx(
        styles.toast,
        typeClasses[type],
        closing && styles.closing,
      )}
      role={type === "error" ? "alert" : "status"}
    >
      <span className={styles.icon}>
        <ToastIcon type={type} />
      </span>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      <button
        type="button"
        className={styles.close}
        aria-label={`Dismiss notification: ${title}`}
        onClick={() => toast.dismiss(id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export interface ToasterProps {
  theme?: ToastTheme;
  position?: ToastPosition;
  max?: number;
}

export function Toaster({
  theme = "dark",
  position = "bottom-right",
  max = 4,
}: ToasterProps) {
  const items = useToasts();
  const visible = max > 0 ? items.slice(-max) : items;

  return (
    <div
      className={cx(
        styles.viewport,
        styles[theme],
        positionClasses[position],
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {visible.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}
