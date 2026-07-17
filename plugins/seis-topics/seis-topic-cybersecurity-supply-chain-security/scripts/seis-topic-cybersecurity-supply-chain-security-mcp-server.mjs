#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cybersecurity-supply-chain-security",
  "displayName": "Supply Chain Security",
  "category": "Cybersecurity",
  "categoryId": "cybersecurity",
  "sourceText": "Supply Chain Security",
  "sourcePath": "./plugins/seis-topics/seis-topic-cybersecurity-supply-chain-security"
});
