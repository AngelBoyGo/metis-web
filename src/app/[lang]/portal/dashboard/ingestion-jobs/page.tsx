import ActionInterceptors from "../../components/ActionInterceptors";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function IngestionJobsWorkspace() {
  const contract = WORKSPACE_CONTRACTS["ingestion-jobs"];

  return (
    <WorkspaceRouteFrame routeSegment="ingestion-jobs" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="DEMO"
        intro="Ingestion job control — queued carrier workloads, lane status, and byte metering from submit through artifact download."
      />
      <ScenarioStepper demoStep={3} />
      <TrustPane filter={["INGESTION_AT_SCALE", "BIT_METERING"]} />
      <ActionInterceptors />
    </WorkspaceRouteFrame>
  );
}
