#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-ai-safety",
  "displayName": "AI Safety",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "AI Safety",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-ai-safety"
});
