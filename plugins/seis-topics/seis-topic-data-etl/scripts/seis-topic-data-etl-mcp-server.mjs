#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-etl",
  "displayName": "ETL",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "ETL",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-etl"
});
