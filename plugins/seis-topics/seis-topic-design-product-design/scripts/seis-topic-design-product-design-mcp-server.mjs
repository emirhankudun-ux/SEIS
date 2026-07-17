#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-design-product-design",
  "displayName": "Product Design",
  "category": "Design",
  "categoryId": "design",
  "sourceText": "Product Design",
  "sourcePath": "./plugins/seis-topics/seis-topic-design-product-design"
});
