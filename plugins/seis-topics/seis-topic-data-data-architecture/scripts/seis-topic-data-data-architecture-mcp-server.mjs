#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-architecture",
  "displayName": "Data Architecture",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Architecture",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-architecture"
});
