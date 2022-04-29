import { AppConfig } from "appbee";

const app: AppConfig = {
  port: 3000,
  host: "127.0.0.1",
  useMultiTenant: false,
  mountRestOn: "/api",
  ioTransport: ["websocket"], //['polling','websocket']
};

export default app;
