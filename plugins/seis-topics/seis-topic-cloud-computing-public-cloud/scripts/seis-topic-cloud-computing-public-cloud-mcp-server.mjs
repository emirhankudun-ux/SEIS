#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-public-cloud",
  "displayName": "Public Cloud",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Public Cloud",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-public-cloud"
});
