#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-chemistry",
  "displayName": "Chemistry",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Chemistry",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-chemistry"
});
