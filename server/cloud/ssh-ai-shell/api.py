from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from reasoning_agent import ReasoningAgent
from ai_engine import AIEngine
import uvicorn

app = FastAPI(title="SEIS AGI API", version="1.0.0")

class ChatRequest(BaseModel):
    message: str
    username: Optional[str] = "user"

class ChatResponse(BaseModel):
    response: str

engine = AIEngine()
agent = ReasoningAgent(engine)

@app.get("/")
async def root():
    return {"status": "online", "system": "SEIS AGI"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        response_chunks = []
        for chunk in agent.process(request.message):
            response_chunks.append(chunk)
        return ChatResponse(response="".join(response_chunks))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
