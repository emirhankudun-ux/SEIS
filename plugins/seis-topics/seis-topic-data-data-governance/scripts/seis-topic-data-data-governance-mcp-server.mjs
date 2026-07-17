#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-governance",
  "displayName": "Data Governance",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Governance",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-governance"
});
