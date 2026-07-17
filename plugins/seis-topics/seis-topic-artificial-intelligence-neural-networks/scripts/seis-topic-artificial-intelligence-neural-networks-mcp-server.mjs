#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-neural-networks",
  "displayName": "Neural Networks",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Neural Networks",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-neural-networks"
});
