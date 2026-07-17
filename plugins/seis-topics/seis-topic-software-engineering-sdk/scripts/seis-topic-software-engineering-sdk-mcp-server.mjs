#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-sdk",
  "displayName": "SDK",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "SDK",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-sdk"
});
