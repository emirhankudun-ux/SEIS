#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-sql",
  "displayName": "SQL",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "SQL",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-sql"
});
