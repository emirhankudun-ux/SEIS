#!/usr/bin/env node
import { startTopicPlugin } from "../runtime/topic-plugin-runtime.mjs";

startTopicPlugin({
  "id": "seis-topic-eleni-neferi-cinematic-experience",
  "displayName": "Cinematic Experience",
  "category": "ELENI-NEFERI",
  "categoryId": "eleni-neferi",
  "sourceText": "Cinematic Experience bunlarla ilgili eklentiler oluşturup bütün eklentiler geliştirilecek",
  "sourcePath": "./plugins/seis-topics/seis-topic-eleni-neferi-cinematic-experience"
});
