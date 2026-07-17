#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-science",
  "displayName": "Data Science",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Science",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-science"
});
