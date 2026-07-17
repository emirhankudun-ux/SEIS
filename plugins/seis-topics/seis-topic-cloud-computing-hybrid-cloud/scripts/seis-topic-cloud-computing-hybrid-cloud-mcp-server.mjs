#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-hybrid-cloud",
  "displayName": "Hybrid Cloud",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Hybrid Cloud",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-hybrid-cloud"
});
