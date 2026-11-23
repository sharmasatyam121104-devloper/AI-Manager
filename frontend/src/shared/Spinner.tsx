import type { ComponentProps } from "react";
import styles from "./Spinner.module.css";
import { cx } from "./utils";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<SpinnerSize, string | undefined> = {
  xs: styles.spinnerXs,
  sm: styles.spinnerSm,
  md: styles.spinnerMd,
  lg: styles.spinnerLg,
  xl: styles.spinnerXl,
};

export interface SpinnerProps extends Omit<ComponentProps<"span">, "children"> {
  size?: SpinnerSize;
  label?: string;
  inline?: boolean;
}

export function Spinner({
  size = "md",
  label = "Loading",
  inline = false,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      className={cx(
        styles.wrapper,
        inline && styles.inline,
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-live="polite"
      {...rest}
    >
      <span className={styles.circle} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}

export interface LoadingOverlayProps {
  label?: string;
  className?: string;
}

export function LoadingOverlay({ label = "Loading", className }: LoadingOverlayProps) {
  return (
    <div className={cx(styles.overlay, className)}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
