#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-programming-languages",
  "displayName": "Programming Languages",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Programming Languages",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-programming-languages"
});
