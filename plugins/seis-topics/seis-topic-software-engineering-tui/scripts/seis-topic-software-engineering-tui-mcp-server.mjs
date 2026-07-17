#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-software-engineering-tui",
  "displayName": "TUI",
  "category": "Software Engineering",
  "categoryId": "software-engineering",
  "sourceText": "TUI",
  "sourcePath": "./plugins/seis-topics/seis-topic-software-engineering-tui"
});
