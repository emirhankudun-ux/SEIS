#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-biology",
  "displayName": "Biology",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Biology",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-biology"
});
