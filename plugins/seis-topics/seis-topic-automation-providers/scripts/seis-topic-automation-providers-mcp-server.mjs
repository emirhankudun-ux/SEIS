#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-providers",
  "displayName": "Providers",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Providers",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-providers"
});
