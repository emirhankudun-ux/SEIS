#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-software-architecture",
  "displayName": "Software Architecture",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Software Architecture",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-software-architecture"
});
