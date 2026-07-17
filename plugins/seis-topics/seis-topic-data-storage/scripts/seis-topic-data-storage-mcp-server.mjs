#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-storage",
  "displayName": "Storage",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Storage",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-storage"
});
