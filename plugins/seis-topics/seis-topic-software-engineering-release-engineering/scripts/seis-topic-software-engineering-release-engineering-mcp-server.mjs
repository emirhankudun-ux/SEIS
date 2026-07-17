#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-release-engineering",
  "displayName": "Release Engineering",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Release Engineering",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-release-engineering"
});
