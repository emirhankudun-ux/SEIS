#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-semantic-search",
  "displayName": "Semantic Search",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Semantic Search",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-semantic-search"
});
