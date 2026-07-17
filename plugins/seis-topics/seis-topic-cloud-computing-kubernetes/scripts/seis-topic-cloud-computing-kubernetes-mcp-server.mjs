#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-kubernetes",
  "displayName": "Kubernetes",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Kubernetes",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-kubernetes"
});
