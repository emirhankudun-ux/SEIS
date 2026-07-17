#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-git",
  "displayName": "Git",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Git",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-git"
});
