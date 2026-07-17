#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-containers",
  "displayName": "Containers",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Containers",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-containers"
});
