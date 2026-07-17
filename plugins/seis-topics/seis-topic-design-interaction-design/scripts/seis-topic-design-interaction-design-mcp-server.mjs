#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-interaction-design",
  "displayName": "Interaction Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Interaction Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-interaction-design"
});
