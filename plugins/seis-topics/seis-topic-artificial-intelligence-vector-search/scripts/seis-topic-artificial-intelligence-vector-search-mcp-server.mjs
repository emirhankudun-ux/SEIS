#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-vector-search",
  "displayName": "Vector Search",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Vector Search",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-vector-search"
});
