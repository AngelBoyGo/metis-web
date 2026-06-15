import ActionInterceptors from "../../components/ActionInterceptors";
import HardwareHealthPane from "../../components/HardwareHealthPane";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function HardwareHealthWorkspace() {
  const contract = WORKSPACE_CONTRACTS["hardware-health"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Hardware health — port reachability on 8044/8045 and COM terminal link status polled from
        the carrier health endpoint.
      </p>
      <HardwareHealthPane />
      <ActionInterceptors compact forceStandardLabels />
    </WorkspaceRouteFrame>
  );
}
