#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-generative-ai",
  "displayName": "Generative AI",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Generative AI",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-generative-ai"
});
