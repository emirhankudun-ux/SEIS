#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-search-engine",
  "displayName": "Search Engine",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Search Engine",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-search-engine"
});
