import path from 'node:path';
import { createFileJournalStore } from './fileJournalStore.mjs';
import { createPersistentExecutionJournal } from '../src/core/executionJournal.js';

const [, , journalPath, runId]=process.argv;
if (!journalPath || !path.isAbsolute(journalPath) || typeof runId!=='string' || !/^[a-f0-9-]{16,64}$/i.test(runId)) process.exit(2);
const journal=createPersistentExecutionJournal({storage:createFileJournalStore({filePath:journalPath}),limit:20});
journal.begin({runId,executionMode:'live',provider:'recovery-probe',verifiedExternalAction:false,evidence:[]});
process.exit(23);
