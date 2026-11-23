import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";
import { cx } from "./utils";

export type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export type ButtonShape = "rounded" | "pill";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  fullWidth?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  shape = "rounded",
  loading = false,
  fullWidth = false,
  iconStart,
  iconEnd,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        shape === "pill" && styles.pill,
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} className={styles.spinner} aria-hidden="true" />
      ) : (
        iconStart
      )}
      {children}
      {iconEnd}
    </button>
  );
}
