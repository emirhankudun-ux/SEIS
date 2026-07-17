#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-skills",
  "displayName": "Skills",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Skills",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-skills"
});
