#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-large-language-models",
  "displayName": "Large Language Models",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Large Language Models",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-large-language-models"
});
