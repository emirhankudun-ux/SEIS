#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering",
  "displayName": "Software Engineering",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Software Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering"
});
