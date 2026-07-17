#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-quality-assurance",
  "displayName": "Quality Assurance",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Quality Assurance",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-quality-assurance"
});
