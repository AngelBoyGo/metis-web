import ActionInterceptors from "../../components/ActionInterceptors";
import HardwareHealthPane from "../../components/HardwareHealthPane";
import styles from "../portal.module.css";

export default function HardwareHealthWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Hardware health — port reachability on 8044/8045 and COM terminal link status polled from
        the carrier health endpoint.
      </p>
      <HardwareHealthPane />
      <ActionInterceptors compact />
    </>
  );
}
