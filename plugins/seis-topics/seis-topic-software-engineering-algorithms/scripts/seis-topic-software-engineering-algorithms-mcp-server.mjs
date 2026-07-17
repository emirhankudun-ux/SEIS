#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-algorithms",
  "displayName": "Algorithms",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Algorithms",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-algorithms"
});
