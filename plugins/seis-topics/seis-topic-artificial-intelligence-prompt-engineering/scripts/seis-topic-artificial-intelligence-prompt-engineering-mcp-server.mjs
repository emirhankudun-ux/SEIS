#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-prompt-engineering",
  "displayName": "Prompt Engineering",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Prompt Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-prompt-engineering"
});
