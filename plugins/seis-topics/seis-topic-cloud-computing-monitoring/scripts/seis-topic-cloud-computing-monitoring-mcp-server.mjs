#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-monitoring",
  "displayName": "Monitoring",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Monitoring",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-monitoring"
});
