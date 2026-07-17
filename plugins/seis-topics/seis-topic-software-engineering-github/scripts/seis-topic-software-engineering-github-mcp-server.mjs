#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-github",
  "displayName": "GitHub",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "GitHub",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-github"
});
