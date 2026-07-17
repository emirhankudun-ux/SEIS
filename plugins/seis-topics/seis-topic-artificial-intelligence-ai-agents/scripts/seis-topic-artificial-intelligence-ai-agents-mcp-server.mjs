#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-ai-agents",
  "displayName": "AI Agents",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "AI Agents",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-ai-agents"
});
