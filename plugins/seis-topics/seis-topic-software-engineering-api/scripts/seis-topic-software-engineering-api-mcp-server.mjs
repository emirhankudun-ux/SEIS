#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-api",
  "displayName": "API",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "API",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-api"
});
