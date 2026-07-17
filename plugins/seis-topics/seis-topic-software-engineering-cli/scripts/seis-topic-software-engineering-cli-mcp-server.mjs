#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-cli",
  "displayName": "CLI",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "CLI",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-cli"
});
