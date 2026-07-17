#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-creative-production-asset-management",
  "displayName": "Asset Management",
  "category": "Creative Production",
  "categoryId": "creative-production",
  "sourceText": "Asset Management",
  "sourcePath": "./plugins/seis-topics/seis-topic-creative-production-asset-management"
});
