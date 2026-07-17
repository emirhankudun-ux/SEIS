#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-repository",
  "displayName": "Repository",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Repository",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-repository"
});
