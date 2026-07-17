#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-lifestyle",
  "displayName": "Lifestyle",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Lifestyle",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-lifestyle"
});
