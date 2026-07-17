#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-digital-art",
  "displayName": "Digital Art",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Digital Art",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-digital-art"
});
