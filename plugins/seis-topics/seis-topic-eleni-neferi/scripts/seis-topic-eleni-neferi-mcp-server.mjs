#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi",
  "displayName": "ELENI-NEFERI",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "ELENI-NEFERI",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi"
});
