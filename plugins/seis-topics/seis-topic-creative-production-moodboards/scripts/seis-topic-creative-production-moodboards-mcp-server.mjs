#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-moodboards",
  "displayName": "Moodboards",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Moodboards",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-moodboards"
});
