import { useId, type ComponentProps, type ReactNode } from "react";
import styles from "./Input.module.css";
import { cx } from "./utils";

export type FieldSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  inputSize?: FieldSize;
}

export function Input({
  label,
  hint,
  error,
  iconStart,
  iconEnd,
  inputSize = "md",
  id,
  className,
  disabled,
  required,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div
        className={cx(
          styles.field,
          styles[inputSize],
          error ? styles.invalid : null,
        )}
      >
        {iconStart && (
          <span className={styles.icon} aria-hidden="true">
            {iconStart}
          </span>
        )}
        <input
          id={inputId}
          className={styles.input}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
        {iconEnd && (
          <span className={styles.icon} aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </div>

      {message && (
        <p
          id={messageId}
          className={cx(styles.message, error && styles.errorMessage)}
        >
          {message}
        </p>
      )}
    </div>
  );
}
