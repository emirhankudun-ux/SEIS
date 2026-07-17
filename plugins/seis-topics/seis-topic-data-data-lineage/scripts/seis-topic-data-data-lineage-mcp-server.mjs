#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-lineage",
  "displayName": "Data Lineage",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Lineage",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-lineage"
});
