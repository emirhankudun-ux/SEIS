#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-devsecops",
  "displayName": "DevSecOps",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "DevSecOps",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-devsecops"
});
