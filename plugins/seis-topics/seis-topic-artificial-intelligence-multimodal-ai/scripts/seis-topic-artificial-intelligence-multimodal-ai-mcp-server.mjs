#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-multimodal-ai",
  "displayName": "Multimodal AI",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Multimodal AI",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-multimodal-ai"
});
