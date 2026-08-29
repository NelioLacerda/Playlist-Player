import { useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export default function UpdateChecker() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "downloading" | "none">("idle");

  async function checkForUpdates() {
    setStatus("checking");
    const update = await check();

    if (!update) {
      setStatus("none");
      return;
    }

    setStatus("available");
    setStatus("downloading");
    await update.downloadAndInstall();
    await relaunch();
  }

  return (
    <button className="btn" onClick={checkForUpdates}>
      {status === "checking" && "Checking..."}
      {status === "downloading" && "Updating..."}
      {status === "none" && "Up to date"}
      {(status === "idle" || status === "available") && "Check for updates"}
    </button>
  );
}