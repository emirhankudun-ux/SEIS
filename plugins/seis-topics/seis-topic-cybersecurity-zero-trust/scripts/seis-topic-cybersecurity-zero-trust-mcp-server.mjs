#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-zero-trust",
  "displayName": "Zero Trust",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Zero Trust",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-zero-trust"
});
