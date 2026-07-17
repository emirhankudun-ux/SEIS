#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-knowledge-digital-twin",
  "displayName": "Digital Twin",
  "category": "Knowledge",
  "categoryId": "knowledge",
  "sourceText": "Digital Twin",
  "sourcePath": "./plugins/seis-topics/seis-topic-knowledge-digital-twin"
});
