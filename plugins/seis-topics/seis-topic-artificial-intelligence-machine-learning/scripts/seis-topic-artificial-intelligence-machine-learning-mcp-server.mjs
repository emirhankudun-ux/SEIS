#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-machine-learning",
  "displayName": "Machine Learning",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Machine Learning",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-machine-learning"
});
