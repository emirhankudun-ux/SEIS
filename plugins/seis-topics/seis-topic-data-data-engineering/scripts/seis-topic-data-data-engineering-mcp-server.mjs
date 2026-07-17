#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-engineering",
  "displayName": "Data Engineering",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-engineering"
});
