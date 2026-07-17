#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-physics",
  "displayName": "Physics",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Physics",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-physics"
});
