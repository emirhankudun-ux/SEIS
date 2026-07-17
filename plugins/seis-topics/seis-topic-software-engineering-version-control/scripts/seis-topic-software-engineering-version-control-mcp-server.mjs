#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-version-control",
  "displayName": "Version Control",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Version Control",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-version-control"
});
