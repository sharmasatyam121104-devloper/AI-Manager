import { Children, type ReactNode } from "react";
import styles from "./Avatar.module.css";
import { cx, getInitials } from "./utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  square?: boolean;
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  square = false,
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const label = alt ?? (name ? `${name} avatar` : "Avatar");

  return (
    <span
      className={cx(
        styles.avatar,
        styles[size],
        square && styles.square,
        className,
      )}
      data-status={status}
    >
      {src ? (
        <img className={styles.image} src={src} alt={label} />
      ) : (
        <span className={styles.fallback}>{initials || "?"}</span>
      )}
      {status && <span className={cx(styles.status, styles[status])} />}
    </span>
  );
}

export interface AvatarGroupProps {
  children?: ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const visible = max > 0 ? items.slice(0, max) : items;
  const overflow = items.length - visible.length;

  return (
    <div className={cx(styles.group, className)}>
      {visible}
      {overflow > 0 && (
        <span className={cx(styles.avatar, styles[size], styles.overflow)}>
          +{overflow}
        </span>
      )}
    </div>
  );
}
