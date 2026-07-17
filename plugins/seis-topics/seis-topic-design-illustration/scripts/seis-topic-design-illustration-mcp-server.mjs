#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-illustration",
  "displayName": "Illustration",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Illustration",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-illustration"
});
