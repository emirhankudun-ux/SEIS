#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-knowledge-graph",
  "displayName": "Knowledge Graph",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Knowledge Graph",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-knowledge-graph"
});
