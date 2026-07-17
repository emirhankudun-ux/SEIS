#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-audio-ai",
  "displayName": "Audio AI",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Audio AI",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-audio-ai"
});
