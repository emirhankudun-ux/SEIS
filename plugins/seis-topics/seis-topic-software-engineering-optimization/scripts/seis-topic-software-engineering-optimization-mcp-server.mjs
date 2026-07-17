#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-optimization",
  "displayName": "Optimization",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Optimization",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-optimization"
});
