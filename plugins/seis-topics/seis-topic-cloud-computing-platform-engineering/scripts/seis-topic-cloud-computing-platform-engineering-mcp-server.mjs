#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-platform-engineering",
  "displayName": "Platform Engineering",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Platform Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-platform-engineering"
});
