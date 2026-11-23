import { useId, type ComponentProps, type ReactNode } from "react";
import styles from "./Textarea.module.css";
import { cx } from "./utils";
import type { FieldSize } from "./Input";

export interface TextareaProps
  extends Omit<ComponentProps<"textarea">, "rows"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  rows?: number;
  textareaSize?: FieldSize;
  showCount?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  rows = 4,
  textareaSize = "md",
  showCount = false,
  id,
  className,
  disabled,
  required,
  maxLength,
  value,
  defaultValue,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const messageId = `${textareaId}-message`;
  const message = error ?? hint;
  const length =
    typeof value === "string" ? value.length : undefined;

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {(label || showCount) && (
        <div className={styles.labelRow}>
          {label && (
            <label className={styles.label} htmlFor={textareaId}>
              {label}
              {required && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {showCount && maxLength !== undefined && (
            <span className={styles.counter}>
              {length ?? String(defaultValue ?? "").length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cx(
          styles.textarea,
          styles[textareaSize],
          error ? styles.invalid : null,
        )}
        {...rest}
      />

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
