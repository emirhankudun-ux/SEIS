#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-clean-architecture",
  "displayName": "Clean Architecture",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Clean Architecture",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-clean-architecture"
});
