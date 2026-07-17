#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-innovation",
  "displayName": "Innovation",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Innovation",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-innovation"
});
