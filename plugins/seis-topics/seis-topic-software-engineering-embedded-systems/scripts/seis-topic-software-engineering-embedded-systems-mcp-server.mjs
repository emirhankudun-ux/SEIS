#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-embedded-systems",
  "displayName": "Embedded Systems",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Embedded Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-embedded-systems"
});
