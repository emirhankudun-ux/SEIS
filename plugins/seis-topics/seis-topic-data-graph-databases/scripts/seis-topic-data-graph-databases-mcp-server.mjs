#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-graph-databases",
  "displayName": "Graph Databases",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Graph Databases",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-graph-databases"
});
