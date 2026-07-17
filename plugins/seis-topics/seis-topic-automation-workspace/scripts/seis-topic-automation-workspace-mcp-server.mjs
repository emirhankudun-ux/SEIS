#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-workspace",
  "displayName": "Workspace",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Workspace",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-workspace"
});
