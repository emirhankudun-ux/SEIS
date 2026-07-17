#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-computer-vision",
  "displayName": "Computer Vision",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Computer Vision",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-computer-vision"
});
