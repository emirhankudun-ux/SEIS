#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-debugging",
  "displayName": "Debugging",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Debugging",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-debugging"
});
