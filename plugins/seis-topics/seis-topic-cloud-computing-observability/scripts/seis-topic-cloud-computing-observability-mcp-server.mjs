#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-observability",
  "displayName": "Observability",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Observability",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-observability"
});
