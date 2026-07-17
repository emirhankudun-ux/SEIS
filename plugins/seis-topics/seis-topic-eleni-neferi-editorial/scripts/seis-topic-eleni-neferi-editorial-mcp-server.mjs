#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-editorial",
  "displayName": "Editorial",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Editorial",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-editorial"
});
