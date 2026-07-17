#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-data-pipelines",
  "displayName": "Data Pipelines",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Data Pipelines",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-data-pipelines"
});
