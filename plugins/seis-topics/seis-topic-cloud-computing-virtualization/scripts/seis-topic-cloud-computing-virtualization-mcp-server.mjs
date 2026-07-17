#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-virtualization",
  "displayName": "Virtualization",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Virtualization",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-virtualization"
});
