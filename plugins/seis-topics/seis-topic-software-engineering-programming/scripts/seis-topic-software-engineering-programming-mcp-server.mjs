#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-programming",
  "displayName": "Programming",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Programming",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-programming"
});
