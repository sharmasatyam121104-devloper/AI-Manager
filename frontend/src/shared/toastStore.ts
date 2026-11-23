import { useSyncExternalStore } from "react";

export type ToastType = "info" | "success" | "warning" | "error" | "loading";

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
  type: ToastType;
  closing: boolean;
}

let idCounter = 0;
let items: ToastItem[] = [];
let snapshot: ToastItem[] = [];
const listeners = new Set<() => void>();

function commit(next: ToastItem[]) {
  items = next;
  snapshot = [...next];
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export const toast = {
  add(options: ToastOptions): number {
    const id = (idCounter += 1);
    const type = options.type ?? "info";
    commit([...items, { ...options, type, id, closing: false }]);
    return id;
  },
  dismiss(id: number): void {
    if (!items.some((item) => item.id === id)) return;
    commit(items.map((item) => (item.id === id ? { ...item, closing: true } : item)));
    window.setTimeout(() => {
      commit(items.filter((item) => item.id !== id));
    }, 240);
  },
  clear(): void {
    commit([]);
  },
  update(id: number, options: Partial<ToastOptions>): void {
    if (!items.some((item) => item.id === id)) return;
    commit(
      items.map((item) =>
        item.id === id ? { ...item, ...options, id: item.id } : item,
      ),
    );
  },
};

export function useToasts(): ToastItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
