#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-telemetry",
  "displayName": "Telemetry",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Telemetry",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-telemetry"
});
