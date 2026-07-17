#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-graphic-design",
  "displayName": "Graphic Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Graphic Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-graphic-design"
});
