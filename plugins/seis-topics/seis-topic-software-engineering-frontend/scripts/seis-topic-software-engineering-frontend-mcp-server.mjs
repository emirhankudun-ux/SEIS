#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-frontend",
  "displayName": "Frontend",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Frontend",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-frontend"
});
