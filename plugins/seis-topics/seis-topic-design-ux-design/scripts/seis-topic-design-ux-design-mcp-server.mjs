#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-ux-design",
  "displayName": "UX Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "UX Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-ux-design"
});
