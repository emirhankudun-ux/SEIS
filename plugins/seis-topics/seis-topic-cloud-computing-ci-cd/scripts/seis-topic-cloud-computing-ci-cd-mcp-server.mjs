#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-ci-cd",
  "displayName": "CI/CD",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "CI/CD",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-ci-cd"
});
