#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production",
  "displayName": "Creative Production",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Creative Production",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production"
});
