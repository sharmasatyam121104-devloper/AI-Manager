import type { ComponentProps, ReactNode } from "react";
import styles from "./Badge.module.css";
import { cx } from "./utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  iconStart?: ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  iconStart,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(
        styles.badge,
        styles[variant],
        styles[size],
        className,
      )}
      {...rest}
    >
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {iconStart}
      {children}
    </span>
  );
}
