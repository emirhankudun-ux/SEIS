# Alpha.8 publication reconciliation

The final publication parent is `97c230ab245da35f1238b4353244ead1b03bc53e`.
After the code was reconciled against `28ba01d`, two further commits changed only README.md and docs/ALPHA7-VERIFICATION.md. Their receipt-identity documentation is retained: the historical alpha.7 record is preserved intact, and the new alpha.8 README describes the current implementation and verification boundary.

No source or tests changed in this final upstream delta. The 152-test alpha.8 code, 17-check offline browser result and real read-only MCP process check are unchanged. The original update_ref attempt was correctly refused as non-fast-forward; no force update was used. The final commit preserves all upstream parent history.

See ALPHA8-MCP-STDIO.md for implementation scope. No main-branch merge or production deployment is authorized by this publication.
