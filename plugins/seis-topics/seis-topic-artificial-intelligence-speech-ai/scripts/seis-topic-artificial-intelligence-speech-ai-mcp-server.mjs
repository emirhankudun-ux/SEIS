#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-artificial-intelligence-speech-ai",
  "displayName": "Speech AI",
  "category": "Artificial Intelligence",
  "categoryId": "artificial-intelligence",
  "sourceText": "Speech AI",
  "sourcePath": "./plugins/seis-topics/seis-topic-artificial-intelligence-speech-ai"
});
