#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-encryption",
  "displayName": "Encryption",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Encryption",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-encryption"
});
