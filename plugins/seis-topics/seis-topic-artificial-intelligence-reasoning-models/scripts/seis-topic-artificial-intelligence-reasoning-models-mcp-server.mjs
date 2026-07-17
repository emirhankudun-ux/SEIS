#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-reasoning-models",
  "displayName": "Reasoning Models",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Reasoning Models",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-reasoning-models"
});
