#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-data-elt",
  "displayName": "ELT",
  "category": "Data",
  "categoryId": "data",
  "sourceText": "ELT",
  "sourcePath": "./plugins/seis-topics/seis-topic-data-elt"
});
