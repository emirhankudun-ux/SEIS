#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing",
  "displayName": "Cloud Computing",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Cloud Computing",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing"
});
