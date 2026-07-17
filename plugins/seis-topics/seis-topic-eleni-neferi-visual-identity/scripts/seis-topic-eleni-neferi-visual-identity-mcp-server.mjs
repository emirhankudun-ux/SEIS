#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-visual-identity",
  "displayName": "Visual Identity",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Visual Identity",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-visual-identity"
});
