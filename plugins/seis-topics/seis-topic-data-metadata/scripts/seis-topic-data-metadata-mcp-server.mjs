#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-metadata",
  "displayName": "Metadata",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "Metadata",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-metadata"
});
