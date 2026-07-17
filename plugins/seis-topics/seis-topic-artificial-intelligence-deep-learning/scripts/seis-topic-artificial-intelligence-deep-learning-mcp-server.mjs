#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-deep-learning",
  "displayName": "Deep Learning",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Deep Learning",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-deep-learning"
});
