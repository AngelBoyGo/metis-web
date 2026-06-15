export type AuditTrailRow = {
  timestamp: string;
  actor: string;
  action: string;
  status: string;
};

export type ScenarioField = {
  key: string;
  value: string;
};

export type ScenarioStage = {
  id: string;
  label: string;
  fields: ScenarioField[];
  output: string;
  progress: number | null;
  progressComplete?: boolean;
};

export type DemoKeyEntry = {
  id: string;
  token: string;
};

export type OverviewCounterFixture = {
  active_tenants: number;
  throughput: number;
  uptime: string;
};

export const DEMO_SOURCE_NODE = "carrier-bridge-sea-01.metis.internal";

export const DEMO_AUDIT_ROWS: AuditTrailRow[] = [
  {
    timestamp: "2026-06-14T09:12:04Z",
    actor: "steve@autonomouslogistics.io",
    action: "SESSION_LOGIN",
    status: "OK",
  },
  {
    timestamp: "2026-06-14T09:14:22Z",
    actor: "steve@autonomouslogistics.io",
    action: "KEY_ISSUE mgk_live_au_…9X2F",
    status: "OK",
  },
  {
    timestamp: "2026-06-14T09:18:01Z",
    actor: "steve@autonomouslogistics.io",
    action: "JOB_SUBMIT JOB_AU_7939_X9",
    status: "QUEUED",
  },
  {
    timestamp: "2026-06-14T09:22:47Z",
    actor: "carrier-lane-05",
    action: "INGEST_PROGRESS 67%",
    status: "RUNNING",
  },
  {
    timestamp: "2026-06-14T09:31:15Z",
    actor: "steve@autonomouslogistics.io",
    action: "ARTIFACT_DOWNLOAD seattle_lidar_trajectory_au_compressed.bin",
    status: "OK",
  },
  {
    timestamp: "2026-06-14T09:33:02Z",
    actor: "steve@autonomouslogistics.io",
    action: "KEY_REVOKE RVK_AU_0041",
    status: "PURGED",
  },
];

export const DEMO_OVERVIEW_COUNTERS: OverviewCounterFixture = {
  active_tenants: 1,
  throughput: 12.4,
  uptime: "99.98%",
};

export const DEMO_SCENARIO_STAGES: ScenarioStage[] = [
  {
    id: "onboarding",
    label: "ONBOARDING",
    fields: [
      {
        key: "ACTION",
        value: "Steve opens metis.gold/en/portal/login · enterprise registration",
      },
      {
        key: "STEALTH_GATE",
        value: "Unauthenticated scan of /dashboard → notFound() → HTTP 404",
      },
      {
        key: "RESULT",
        value: "Session cookie issued · operator record created in metis.db",
      },
    ],
    output:
      "[STAGE_01] operator=steve@autonomouslogistics.io session=ACTIVE · dashboard_scan_blocked=YES · http_status=404_stealth",
    progress: null,
  },
  {
    id: "token",
    label: "TOKEN ISSUANCE",
    fields: [
      { key: "KEY_PREFIX", value: "mgk_live_au_" },
      { key: "TTL", value: "3600s · one-time reveal" },
      {
        key: "SCOPE",
        value: "ingest:write · ledger:read · vault:rotate",
      },
      { key: "HASH", value: "sha256:9c4e2a1f… · at rest" },
    ],
    output:
      "[STAGE_02] prefix=mgk_live_au_… scope=ingest:write, ledger:read plaintext_window=OPEN · ttl=3600s credential_hash=sha256:9c4e2a1f… · stored=YES",
    progress: 28,
  },
  {
    id: "submit",
    label: "JOB SUBMIT",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "FILTER_COEFFICIENT", value: "LSB <= 2" },
      { key: "QUEUE", value: "lane_primary · priority=NORMAL" },
    ],
    output:
      "[STAGE_03] job_id=JOB_AU_7939_X9 lane=LANE_05_AXIS_CLAMP filter_coeff=LSB<=2 · queue=lane_primary state=QUEUED · bytes_in=0 · progress=45%",
    progress: 45,
  },
  {
    id: "status",
    label: "STATUS BAR",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "CARRIER_LANE", value: "LANE_05_AXIS_CLAMP" },
      { key: "BYTES_PROCESSED", value: "4,218,560" },
      { key: "TRANSACTION_RATE", value: "12.4 req/s" },
    ],
    output:
      "[STAGE_04] job_id=JOB_AU_7939_X9 progress=67% bytes_processed=4218560 · poll_interval=5s transaction_rate=12.4 req/s · lane=LANE_05_AXIS_CLAMP",
    progress: 67,
  },
  {
    id: "download",
    label: "DOWNLOAD ARTIFACT",
    fields: [
      { key: "JOB_ID", value: "JOB_AU_7939_X9" },
      { key: "FILE", value: "seattle_lidar_trajectory_au_compressed.bin" },
      {
        key: "SIZE",
        value: "847 MB (compressed from 4 GB · ratio 4.72:1)",
      },
      {
        key: "CORRECTION",
        value: "AU radial offset applied · LSB filter pass confirmed",
      },
      { key: "CHECKSUM", value: "sha256:7f3a91c2… · verified" },
    ],
    output:
      "[STAGE_05] artifact=seattle_lidar_trajectory_au_compressed.bin size=847MB ratio=4.72:1 checksum=sha256:7f3a91c2… download=READY · correction=AU_radial",
    progress: 100,
  },
  {
    id: "revoke",
    label: "REVOKE RECEIPT",
    fields: [
      { key: "CREDENTIAL", value: "mgk_live_au_… · last4=9X2F" },
      { key: "REVOKE_ACTION", value: "POST /api/keys/revoke · hard delete" },
      {
        key: "LEDGER",
        value: "api_keys rows 1 → 0 · SHA-256 hash purged",
      },
    ],
    output:
      "[STAGE_06] revoke_id=RVK_AU_0041 credential=mgk_live_au_… rows_deleted=1 ledger_state=CLEAN · receipt=ISSUED",
    progress: null,
    progressComplete: true,
  },
];

export const DEMO_KEYS: DemoKeyEntry[] = [
  {
    id: "key_au_9x2f",
    token: "mgk_live_au_7f3a91c29X2F",
  },
  {
    id: "key_au_rot1",
    token: "mgk_live_au_b4e8c1a1ROT1",
  },
];

export const DEMO_RECEIPT_RECOVERY = {
  receipt_id: "RCV_HW_20260614_0912",
  operator: "steve@autonomouslogistics.io",
  event: "HARDWARE_RECOVERY",
  device: "Artix-7 carrier-bridge-sea-01",
  recovery_clock_ms: 6200,
  serial_bus: "COM3 @ 115200",
  trace_tail: [
    "[09:12:01] POWER_CYCLE detected · bench supply restored",
    "[09:12:03] REFLASH daemon engaged · bitstream slot B",
    "[09:12:07] LANE_REATTACH lane=05 · heartbeat=OK",
  ],
  lane_state: "ATTACHED",
  pragma: "PRAGMA_OK",
};

export const DEMO_RECEIPT_ZEROIZATION = {
  receipt_id: "RCV_ZER_20260614_0933",
  operator: "steve@autonomouslogistics.io",
  event: "DATA_ZEROIZATION",
  credential: "mgk_live_au_…9X2F",
  revoke_id: "RVK_AU_0041",
  rows_before: 1,
  rows_after: 0,
  hash_purged: "sha256:9c4e2a1f8b3d…",
  audit_timestamp: "2026-06-14T09:33:02Z",
  pragma: "PRAGMA_OK",
};

export const DEMO_EVENT_LOG_STEALTH_404 = {
  log_id: "EVT_STL_20260614_0910",
  event: "ADMIN_ROUTE_CONCEALMENT",
  request_path: "/en/portal/dashboard",
  session: "NONE",
  response: "notFound() stealth envelope",
  http_status: 404,
  topology_leaked: false,
  source_ip: "203.0.113.44",
  user_agent: "curl/8.4.0",
  entries: [
    { ts: "2026-06-14T09:10:02Z", action: "UNAUTH_SCAN", result: "404_STEALTH" },
    { ts: "2026-06-14T09:10:02Z", action: "ROUTE_MASK", result: "TOPOLOGY_HIDDEN" },
  ],
  pragma: "PRAGMA_OK",
};

export type ReceiptFixtureKey = "recovery" | "zeroization" | "stealth-404";

export const DEMO_RECEIPT_FIXTURES: Record<
  ReceiptFixtureKey,
  Record<string, unknown>
> = {
  recovery: DEMO_RECEIPT_RECOVERY,
  zeroization: DEMO_RECEIPT_ZEROIZATION,
  "stealth-404": DEMO_EVENT_LOG_STEALTH_404,
};

export const RECEIPT_ENDPOINTS: Record<ReceiptFixtureKey, string> = {
  recovery: "/api/receipts/hardware-recovery",
  zeroization: "/api/receipts/data-zeroization",
  "stealth-404": "/api/audit/event-log/stealth-404",
};
