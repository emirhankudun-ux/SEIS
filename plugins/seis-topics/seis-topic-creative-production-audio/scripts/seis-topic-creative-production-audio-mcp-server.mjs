#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-audio",
  "displayName": "Audio",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Audio",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-audio"
});
