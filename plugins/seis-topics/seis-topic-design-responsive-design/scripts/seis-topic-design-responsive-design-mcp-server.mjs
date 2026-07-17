#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-responsive-design",
  "displayName": "Responsive Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Responsive Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-responsive-design"
});
