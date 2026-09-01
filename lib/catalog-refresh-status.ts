export type CatalogRefreshStatus = {
  visible: boolean;
  label: string;
  accessibilityLabel: string;
};

export function getCatalogRefreshStatus(isFetching: number, isInternetReachable?: boolean | null): CatalogRefreshStatus {
  const visible = isFetching > 0 && isInternetReachable === true;
  return {
    visible,
    label: "Refreshing live catalog and inventory",
    accessibilityLabel: "Refreshing live catalog and inventory data.",
  };
}
