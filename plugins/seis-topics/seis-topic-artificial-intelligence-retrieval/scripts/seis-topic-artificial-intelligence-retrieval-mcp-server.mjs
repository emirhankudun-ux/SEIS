#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-retrieval",
  "displayName": "Retrieval",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Retrieval",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-retrieval"
});
