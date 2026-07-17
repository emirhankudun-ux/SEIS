#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-3d-design",
  "displayName": "3D Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "3D Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-3d-design"
});
