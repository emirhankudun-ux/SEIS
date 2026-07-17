#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-infrastructure",
  "displayName": "Infrastructure",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Infrastructure",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-infrastructure"
});
