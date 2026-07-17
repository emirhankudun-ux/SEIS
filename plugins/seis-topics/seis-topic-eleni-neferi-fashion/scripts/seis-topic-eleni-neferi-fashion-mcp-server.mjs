#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-fashion",
  "displayName": "Fashion",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Fashion",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-fashion"
});
