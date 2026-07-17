#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-asset-universe",
  "displayName": "Asset Universe",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Asset Universe",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-asset-universe"
});
