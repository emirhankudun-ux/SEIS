#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-operating-systems",
  "displayName": "Operating Systems",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Operating Systems",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-operating-systems"
});
