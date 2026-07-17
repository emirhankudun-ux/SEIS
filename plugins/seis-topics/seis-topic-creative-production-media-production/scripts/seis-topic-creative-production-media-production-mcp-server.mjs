#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-media-production",
  "displayName": "Media Production",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Media Production",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-media-production"
});
