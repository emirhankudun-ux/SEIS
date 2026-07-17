#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-data-structures",
  "displayName": "Data Structures",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Data Structures",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-data-structures"
});
