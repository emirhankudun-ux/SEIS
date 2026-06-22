# Fine-tune dataset

`prepare_dataset.py`, ham konuşma geçmişini OpenAI fine-tune formatına dönüştürür.

Örnek:

```bash
python3 fine_tune/prepare_dataset.py data/conversations.jsonl fine_tune/output.jsonl
```

Çıktı her satırda tek JSON nesnesi içerir: `{"messages":[... ]}`.
