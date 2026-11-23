import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./Tabs.module.css";
import { cx } from "./utils";

export type TabsVariant = "line" | "pill" | "enclosed";
export type TabsSize = "sm" | "md" | "lg";

interface TabsContextValue {
  baseId: string;
  value: string;
  select: (value: string) => void;
  variant: TabsVariant;
  size: TabsSize;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be used inside <Tabs>`);
  }
  return context;
}

const variantClasses: Record<TabsVariant, string | undefined> = {
  line: styles.variantLine,
  pill: styles.variantPill,
  enclosed: styles.variantEnclosed,
};

const sizeClasses: Record<TabsSize, string | undefined> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export interface TabsProps {
  children?: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  className?: string;
}

export function Tabs({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = "line",
  size = "md",
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const baseId = useId();

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const contextValue = useMemo(
    () => ({ baseId, value, select, variant, size }),
    [baseId, value, select, variant, size],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cx(styles.tabs, className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps {
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function TabsList({ children, className, ...rest }: TabsListProps) {
  const { variant, size } = useTabsContext("TabsList");

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const tabs = Array.from(
      target.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex(
      (tab) => tab === document.activeElement,
    );

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        currentIndex === -1
          ? tabs.length - 1
          : (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  };

  return (
    <div
      role="tablist"
      className={cx(
        styles.list,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export function Tab({ value, children, disabled = false, className, icon }: TabProps) {
  const { baseId, value: activeValue, select } = useTabsContext("Tab");
  const selected = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      className={cx(styles.tab, selected && styles.tabSelected, className)}
      onClick={() => select(value)}
    >
      {icon && <span className={styles.tabIcon}>{icon}</span>}
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children?: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { baseId, value: activeValue } = useTabsContext("TabPanel");
  const selected = activeValue === value;

  if (!selected) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cx(styles.panel, className)}
    >
      {children}
    </div>
  );
}
