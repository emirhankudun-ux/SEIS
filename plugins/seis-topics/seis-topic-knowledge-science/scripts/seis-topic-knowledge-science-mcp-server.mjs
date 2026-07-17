#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-science",
  "displayName": "Science",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Science",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-science"
});
