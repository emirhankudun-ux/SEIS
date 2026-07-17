#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-databases",
  "displayName": "Databases",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Databases",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-databases"
});
