#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-cloud-computing-infrastructure-as-code",
  "displayName": "Infrastructure as Code",
  "category": "Cloud Computing",
  "categoryId": "cloud-computing",
  "sourceText": "Infrastructure as Code",
  "sourcePath": "./plugins/seis-topics/seis-topic-cloud-computing-infrastructure-as-code"
});
