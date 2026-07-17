#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-small-language-models",
  "displayName": "Small Language Models",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Small Language Models",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-small-language-models"
});
