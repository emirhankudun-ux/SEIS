#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-music",
  "displayName": "Music",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Music",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-music"
});
