#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-ai-core",
  "displayName": "AI Core",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "AI Core",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-ai-core"
});
