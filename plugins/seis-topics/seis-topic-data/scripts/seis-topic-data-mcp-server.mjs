#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data",
  "displayName": "Data",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data",
  "sourcePath": "./plugins/seis-topics/seis-topic-data"
});
