import { getCommitToken, getSystemBootSignature } from "@/utils/crypto";
import HomeClient from "./HomeClient";

export default function Home() {
  const bootSignature = getSystemBootSignature();
  const commitToken = getCommitToken();

  return (
    <HomeClient bootSignature={bootSignature} commitToken={commitToken} />
  );
}
