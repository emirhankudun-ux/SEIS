#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-spatial-computing",
  "displayName": "Spatial Computing",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Spatial Computing",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-spatial-computing"
});
