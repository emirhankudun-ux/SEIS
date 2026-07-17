#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-devops",
  "displayName": "DevOps",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "DevOps",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-devops"
});
