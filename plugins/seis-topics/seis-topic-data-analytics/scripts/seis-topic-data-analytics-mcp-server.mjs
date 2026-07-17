#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-analytics",
  "displayName": "Analytics",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Analytics",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-analytics"
});
