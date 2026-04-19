import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("ppClaw", {
  platform: process.platform,
});
