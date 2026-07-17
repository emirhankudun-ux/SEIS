#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-business-intelligence",
  "displayName": "Business Intelligence",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Business Intelligence",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-business-intelligence"
});
