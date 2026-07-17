#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-full-stack",
  "displayName": "Full Stack",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Full Stack",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-full-stack"
});
