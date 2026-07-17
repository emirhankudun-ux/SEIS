#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-quality",
  "displayName": "Data Quality",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Quality",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-quality"
});
