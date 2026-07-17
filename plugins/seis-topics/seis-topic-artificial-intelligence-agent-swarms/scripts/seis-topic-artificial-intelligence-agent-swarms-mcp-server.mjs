#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-agent-swarms",
  "displayName": "Agent Swarms",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Agent Swarms",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-agent-swarms"
});
