#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-mobile-development",
  "displayName": "Mobile Development",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Mobile Development",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-mobile-development"
});
