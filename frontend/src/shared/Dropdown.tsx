import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import styles from "./Dropdown.module.css";
import { cx } from "./utils";

export type DropdownAlign = "start" | "end";
export type DropdownSide = "bottom" | "top";

const alignClasses: Record<DropdownAlign, string | undefined> = {
  start: styles.alignStart,
  end: styles.alignEnd,
};

const sideClasses: Record<DropdownSide, string | undefined> = {
  bottom: styles.sideBottom,
  top: styles.sideTop,
};

interface DropdownContextValue {
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue>({ close: () => {} });

function queryMenuItems(menu: HTMLDivElement | null): HTMLElement[] {
  return Array.from(
    menu?.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])") ??
      [],
  );
}

export interface DropdownTriggerProps {
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}

export interface DropdownProps {
  trigger: (props: DropdownTriggerProps) => ReactNode;
  children?: ReactNode;
  label?: ReactNode;
  align?: DropdownAlign;
  side?: DropdownSide;
  menuWidth?: string;
  className?: string;
  menuClassName?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({
  trigger,
  children,
  label,
  align = "start",
  side = "bottom",
  menuWidth,
  className,
  menuClassName,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const close = useCallback(
    (returnFocus: boolean) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      queryMenuItems(menuRef.current)[0]?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const focusAt = (index: number) => {
    const items = queryMenuItems(menuRef.current);
    if (items.length === 0) return;
    const bounded = (index + items.length) % items.length;
    items[bounded]?.focus();
  };

  const focusStep = (direction: 1 | -1) => {
    const items = queryMenuItems(menuRef.current);
    const activeIndex = items.findIndex(
      (item) => item === document.activeElement,
    );
    if (activeIndex === -1) {
      focusAt(direction === 1 ? 0 : items.length - 1);
      return;
    }
    focusAt(activeIndex + direction);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "ArrowDown" && !open) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusStep(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusStep(-1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(queryMenuItems(menuRef.current).length - 1);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
      default:
        break;
    }
  };

  const triggerProps: DropdownTriggerProps = {
    ref: triggerRef,
    onClick: () => setOpen(!open),
    onKeyDown: handleTriggerKeyDown,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
  };

  const contextValue = useMemo(
    () => ({ close: () => close(true) }),
    [close],
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={rootRef} className={cx(styles.root, className)}>
        {trigger(triggerProps)}
        {open && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            className={cx(
              styles.menu,
              alignClasses[align],
              sideClasses[side],
              menuClassName,
            )}
            style={menuWidth ? { width: menuWidth } : undefined}
            onKeyDown={handleMenuKeyDown}
          >
            {label && <div className={styles.label}>{label}</div>}
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}

export interface DropdownItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  icon?: ReactNode;
  onSelect?: () => void;
  tone?: "default" | "danger";
}

export function DropdownItem({
  icon,
  onSelect,
  tone = "default",
  className,
  children,
  onClick,
  ...rest
}: DropdownItemProps) {
  const { close } = useContext(DropdownContext);

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx(
        styles.item,
        tone === "danger" && styles.itemDanger,
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onSelect?.();
        close();
      }}
      {...rest}
    >
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
    </button>
  );
}

export function DropdownHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.header, className)} {...rest}>
      {children}
    </div>
  );
}

export function DropdownSeparator({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cx(styles.separator, className)}
      {...rest}
    />
  );
}

export function DropdownLabel({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx(styles.groupLabel, className)} {...rest}>
      {children}
    </div>
  );
}
