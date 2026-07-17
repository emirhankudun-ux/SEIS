#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-hexagonal-architecture",
  "displayName": "Hexagonal Architecture",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Hexagonal Architecture",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-hexagonal-architecture"
});
