import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import styles from "./Checkbox.module.css";
import { cx } from "./utils";

export interface CheckboxProps
  extends Omit<ComponentProps<"input">, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
}

export function Checkbox({
  label,
  description,
  indeterminate = false,
  id,
  className,
  disabled,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cx(styles.root, disabled && styles.disabled, className)}
      htmlFor={inputId}
    >
      <span className={styles.control}>
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          <Check size={13} strokeWidth={3} className={styles.checkIcon} />
          <Minus size={13} strokeWidth={3} className={styles.minusIcon} />
        </span>
      </span>

      {(label || description) && (
        <span className={styles.text}>
          {label && <span className={styles.labelText}>{label}</span>}
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </span>
      )}
    </label>
  );
}
