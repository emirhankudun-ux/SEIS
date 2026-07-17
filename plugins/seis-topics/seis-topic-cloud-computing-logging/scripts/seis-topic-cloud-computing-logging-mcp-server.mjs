#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-logging",
  "displayName": "Logging",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Logging",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-logging"
});
