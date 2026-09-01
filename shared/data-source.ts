export type DataSource = "api" | "cache" | "seed";

export type AppMode = {
  source: Exclude<DataSource, "seed">;
  demo: boolean;
};

export const appMode: AppMode = {
  source: "api",
  demo: true,
};

export function sourceLabel(source: DataSource) {
  if (source === "api") return "Live catalog";
  if (source === "cache") return "Cached catalog";
  return "Demo catalog";
}

export function requireLiveData<T>(value: T | undefined, name: string): T {
  if (value === undefined) throw new Error(`Missing live ${name}`);
  return value;
}
