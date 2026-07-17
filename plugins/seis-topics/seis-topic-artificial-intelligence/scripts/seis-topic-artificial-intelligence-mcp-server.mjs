#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence",
  "displayName": "Artificial Intelligence",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Artificial Intelligence",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence"
});
