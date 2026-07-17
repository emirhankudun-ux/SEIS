#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-docker",
  "displayName": "Docker",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Docker",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-docker"
});
