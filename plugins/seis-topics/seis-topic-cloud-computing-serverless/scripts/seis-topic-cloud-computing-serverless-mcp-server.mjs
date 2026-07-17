#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-serverless",
  "displayName": "Serverless",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Serverless",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-serverless"
});
