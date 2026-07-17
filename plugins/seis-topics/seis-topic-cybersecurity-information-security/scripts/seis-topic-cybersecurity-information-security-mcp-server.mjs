#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-information-security",
  "displayName": "Information Security",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Information Security",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-information-security"
});
