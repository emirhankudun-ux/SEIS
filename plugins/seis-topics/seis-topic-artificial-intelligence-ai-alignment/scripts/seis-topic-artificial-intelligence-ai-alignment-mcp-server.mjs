#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-ai-alignment",
  "displayName": "AI Alignment",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "AI Alignment",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-ai-alignment"
});
