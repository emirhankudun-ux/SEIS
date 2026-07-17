#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-memory-systems",
  "displayName": "Memory Systems",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Memory Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-memory-systems"
});
