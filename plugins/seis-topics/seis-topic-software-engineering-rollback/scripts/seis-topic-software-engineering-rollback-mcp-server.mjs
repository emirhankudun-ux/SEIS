#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-rollback",
  "displayName": "Rollback",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Rollback",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-rollback"
});
