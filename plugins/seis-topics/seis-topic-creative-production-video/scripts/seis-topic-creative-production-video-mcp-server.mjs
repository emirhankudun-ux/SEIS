#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-video",
  "displayName": "Video",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Video",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-video"
});
