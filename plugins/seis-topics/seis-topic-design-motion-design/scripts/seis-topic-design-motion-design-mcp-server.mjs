#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-motion-design",
  "displayName": "Motion Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Motion Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-motion-design"
});
