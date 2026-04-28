from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import os
import asyncio
from groq import Groq

router = APIRouter()

def get_groq_client():
    return Groq(api_key=os.environ.get("GROQ_API_KEY"))

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    history: Optional[List[HistoryItem]] = []

def build_messages(history: List[HistoryItem], message: str):
    messages = []
    for item in history:
        messages.append({"role": item.role, "content": item.content})
    messages.append({"role": "user", "content": message})
    return messages

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        client = get_groq_client()
        messages = build_messages(request.history, request.message)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    try:
        client = get_groq_client()
        messages = build_messages(request.history, request.message)

        async def generate() -> AsyncGenerator[str, None]:
            loop = asyncio.get_event_loop()

            def sync_stream():
                chunks = []
                stream = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    stream=True,
                )
                for chunk in stream:
                    text = chunk.choices[0].delta.content or ""
                    if text:
                        chunks.append(text)
                return chunks

            chunks = await loop.run_in_executor(None, sync_stream)
            for chunk in chunks:
                yield chunk
                await asyncio.sleep(0)

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))