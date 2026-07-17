#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-agent-runtime",
  "displayName": "Agent Runtime",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Agent Runtime",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-agent-runtime"
});
