import type { ComponentProps } from "react";
import styles from "./Card.module.css";
import { cx } from "./utils";

export type CardSize = "sm" | "md";
export type CardElevation = "none" | "subtle" | "raised";

const sizeClasses: Record<CardSize, string | undefined> = {
  sm: styles.cardSm,
  md: styles.cardMd,
};

const elevationClasses: Record<CardElevation, string | undefined> = {
  none: styles.elevationNone,
  subtle: styles.elevationSubtle,
  raised: styles.elevationRaised,
};

export interface CardProps extends ComponentProps<"div"> {
  size?: CardSize;
  elevation?: CardElevation;
  interactive?: boolean;
}

export function Card({
  size = "md",
  elevation = "subtle",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        styles.card,
        sizeClasses[size],
        elevationClasses[elevation],
        interactive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends ComponentProps<"div"> {
  align?: "start" | "center";
}

export function CardHeader({
  align = "start",
  className,
  children,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cx(
        styles.header,
        align === "center" && styles.center,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export type CardTitleSize = "sm" | "md" | "lg";

const titleSizeClasses: Record<CardTitleSize, string | undefined> = {
  sm: styles.titleSm,
  md: styles.titleMd,
  lg: styles.titleLg,
};

export interface CardTitleProps extends ComponentProps<"h3"> {
  size?: CardTitleSize;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
}

export function CardTitle({
  size = "md",
  as: Tag = "h3",
  className,
  children,
  ...rest
}: CardTitleProps) {
  return (
    <Tag className={cx(styles.title, titleSizeClasses[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: ComponentProps<"p">) {
  return (
    <p className={cx(styles.description, className)} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...rest
}: ComponentProps<"div">) {
  return (
    <div className={cx(styles.content, className)} {...rest}>
      {children}
    </div>
  );
}

export type CardFooterJustify = "start" | "center" | "end" | "between";

const justifyClasses: Record<CardFooterJustify, string | undefined> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

export interface CardFooterProps extends ComponentProps<"div"> {
  justify?: CardFooterJustify;
}

export function CardFooter({
  justify = "start",
  className,
  children,
  ...rest
}: CardFooterProps) {
  return (
    <div
      className={cx(styles.footer, justifyClasses[justify], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardAction({
  className,
  children,
  ...rest
}: ComponentProps<"div">) {
  return (
    <div className={cx(styles.action, className)} {...rest}>
      {children}
    </div>
  );
}
