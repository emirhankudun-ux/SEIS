#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-migration",
  "displayName": "Migration",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Migration",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-migration"
});
