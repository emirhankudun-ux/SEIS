#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-knowledge-systems",
  "displayName": "Knowledge Systems",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Knowledge Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-knowledge-systems"
});
