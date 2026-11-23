import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";
import { cx } from "./utils";
import type { FieldSize } from "./Input";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<ComponentProps<"select">, "size" | "children"> {
  label?: ReactNode;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  selectSize?: FieldSize;
  children?: ReactNode;
}

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  selectSize = "md",
  id,
  className,
  disabled,
  required,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx(styles.root, disabled && styles.disabled, className)}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div
        className={cx(
          styles.field,
          styles[selectSize],
          error ? styles.invalid : null,
        )}
      >
        <select
          id={selectId}
          className={styles.select}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
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
