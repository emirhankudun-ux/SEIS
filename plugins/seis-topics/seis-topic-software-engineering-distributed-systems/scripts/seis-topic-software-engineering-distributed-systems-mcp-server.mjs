#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-distributed-systems",
  "displayName": "Distributed Systems",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Distributed Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-distributed-systems"
});
