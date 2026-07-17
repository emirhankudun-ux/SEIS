#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-edge-computing",
  "displayName": "Edge Computing",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Edge Computing",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-edge-computing"
});
