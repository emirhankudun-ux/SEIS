#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-nosql",
  "displayName": "NoSQL",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "NoSQL",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-nosql"
});
