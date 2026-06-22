export const tenantProfile = {
  tenantEmail:
    process.env.NEXT_PUBLIC_TENANT_EMAIL ?? "operations@aerospace-fleet.io",
  assetMetric:
    process.env.NEXT_PUBLIC_ASSET_METRIC ?? "2,480 ACTIVE GEODESIC NODES",
  throughputMetric:
    process.env.NEXT_PUBLIC_THROUGHPUT_METRIC ??
    "842.1 MiB/s BITSTREAM INGESTION",
  slaMetric:
    process.env.NEXT_PUBLIC_SLA_METRIC ?? "99.997% HA CLUSTER UPTIME",
} as const;
