#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-story-world",
  "displayName": "Story World",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Story World",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-story-world"
});
