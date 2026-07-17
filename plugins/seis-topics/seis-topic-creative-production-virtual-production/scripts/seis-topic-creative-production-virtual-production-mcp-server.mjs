#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-virtual-production",
  "displayName": "Virtual Production",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Virtual Production",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-virtual-production"
});
