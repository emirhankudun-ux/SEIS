#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-responsible-ai",
  "displayName": "Responsible AI",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Responsible AI",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-responsible-ai"
});
