#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-web-development",
  "displayName": "Web Development",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Web Development",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-web-development"
});
