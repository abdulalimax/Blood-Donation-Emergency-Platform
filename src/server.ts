import app from "./app";
import { config } from "./config/env";

const server = app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
