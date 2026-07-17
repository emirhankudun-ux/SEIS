#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-privacy",
  "displayName": "Privacy",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Privacy",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-privacy"
});
