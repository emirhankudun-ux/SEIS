#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-compilers",
  "displayName": "Compilers",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Compilers",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-compilers"
});
