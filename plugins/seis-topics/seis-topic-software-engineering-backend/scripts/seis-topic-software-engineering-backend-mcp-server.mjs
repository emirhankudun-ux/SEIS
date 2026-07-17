#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-backend",
  "displayName": "Backend",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Backend",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-backend"
});
