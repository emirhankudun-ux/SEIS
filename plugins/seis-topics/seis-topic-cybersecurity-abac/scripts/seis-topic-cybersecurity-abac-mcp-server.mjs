#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-abac",
  "displayName": "ABAC",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "ABAC",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-abac"
});
