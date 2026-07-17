#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-world-models",
  "displayName": "World Models",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "World Models",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-world-models"
});
