#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-natural-language-processing",
  "displayName": "Natural Language Processing",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Natural Language Processing",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-natural-language-processing"
});
