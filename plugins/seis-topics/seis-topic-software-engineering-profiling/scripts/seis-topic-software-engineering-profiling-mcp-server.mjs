#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-profiling",
  "displayName": "Profiling",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Profiling",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-profiling"
});
