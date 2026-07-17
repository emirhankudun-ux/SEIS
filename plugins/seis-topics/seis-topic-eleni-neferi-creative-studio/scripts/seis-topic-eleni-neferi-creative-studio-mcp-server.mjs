#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-creative-studio",
  "displayName": "Creative Studio",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Creative Studio",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-creative-studio"
});
