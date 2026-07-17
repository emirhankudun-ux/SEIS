#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-accessibility",
  "displayName": "Accessibility",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Accessibility",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-accessibility"
});
