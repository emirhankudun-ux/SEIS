#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-metrics",
  "displayName": "Metrics",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Metrics",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-metrics"
});
