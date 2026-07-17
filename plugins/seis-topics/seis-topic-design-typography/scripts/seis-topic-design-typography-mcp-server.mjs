#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-typography",
  "displayName": "Typography",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Typography",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-typography"
});
