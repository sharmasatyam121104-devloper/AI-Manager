import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./Tooltip.module.css";
import { cx } from "./utils";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const sideClasses: Record<TooltipSide, string | undefined> = {
  top: styles.top,
  bottom: styles.bottom,
  left: styles.left,
  right: styles.right,
};

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: TooltipSide;
  delay?: number;
  disabled?: boolean;
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delay = 200,
  disabled = false,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);
  const tooltipId = useId();

  const clear = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = () => {
    if (disabled || !content) return;
    clear();
    timerRef.current = window.setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    clear();
    setOpen(false);
  };

  useEffect(() => clear, []);

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": open && content ? tooltipId : undefined,
      })
    : children;

  return (
    <span
      className={cx(styles.wrapper, className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {child}
      <span
        id={tooltipId}
        role="tooltip"
        className={cx(styles.tooltip, sideClasses[side], open && styles.open)}
        aria-hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
