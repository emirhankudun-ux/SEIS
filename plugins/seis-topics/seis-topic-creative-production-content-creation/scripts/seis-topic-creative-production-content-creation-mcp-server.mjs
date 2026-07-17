#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-content-creation",
  "displayName": "Content Creation",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Content Creation",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-content-creation"
});
