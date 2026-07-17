#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-vector-databases",
  "displayName": "Vector Databases",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Vector Databases",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-vector-databases"
});
