#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-package-managers",
  "displayName": "Package Managers",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "Package Managers",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-package-managers"
});
