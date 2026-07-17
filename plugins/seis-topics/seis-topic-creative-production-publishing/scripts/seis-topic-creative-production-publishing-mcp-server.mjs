#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-publishing",
  "displayName": "Publishing",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Publishing",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-publishing"
});
