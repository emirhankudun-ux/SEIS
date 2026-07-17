#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-sustainability",
  "displayName": "Sustainability",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Sustainability",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-sustainability"
});
