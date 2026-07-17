#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-creative-engineering",
  "displayName": "Creative Engineering",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Creative Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-creative-engineering"
});
