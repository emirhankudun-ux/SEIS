#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-ui-design",
  "displayName": "UI Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "UI Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-ui-design"
});
