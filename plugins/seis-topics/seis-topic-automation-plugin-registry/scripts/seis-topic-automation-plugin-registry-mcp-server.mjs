#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-automation-plugin-registry",
  "displayName": "Plugin Registry",
  "category": "Automation",
  "categoryId": "automation",
  "sourceText": "Plugin Registry",
  "sourcePath": "./plugins/seis-topics/seis-topic-automation-plugin-registry"
});
