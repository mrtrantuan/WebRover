from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager
import json
# Import necessary functions from webrover.py
from .webrover import setup_browser_2, main_agent_graph

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Global variable to store browser session
browser_session: Dict[str, Any] = {
    "playwright": None,
    "browser": None,
    "page": None
}

class BrowserSetupRequest(BaseModel):
    url: str = "https://www.google.com"

class QueryRequest(BaseModel):
    query: str

@app.post("/setup-browser")
async def setup_browser(request: BrowserSetupRequest):
    try:
        # Clear any existing session
        if browser_session["playwright"]:
            await cleanup_browser()
            
        # Setup new browser session
        playwright, browser, page = await setup_browser_2(request.url)
        
        # Store session info
        browser_session.update({
            "playwright": playwright,
            "browser": browser,
            "page": page
        })
        
        return {"status": "success", "message": "Browser setup complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup browser: {str(e)}")

@app.post("/cleanup")
async def cleanup_browser():
    try:
        if browser_session["page"]:
            await browser_session["page"].close()
        if browser_session["browser"]:
            await browser_session["browser"].close()
        if browser_session["playwright"]:
            await browser_session["playwright"].stop()
            
        # Reset session
        browser_session.update({
            "playwright": None,
            "browser": None,
            "page": None
        })
        
        return {"status": "success", "message": "Browser cleanup complete"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup browser: {str(e)}")

async def stream_agent_response(query: str, page):
    # Initialize state
    initial_state = {
        "input": query,
        "page": page,
        "image": "",
        "master_plan": None,
        "bboxes": [],
        "actions_taken": [],
        "action": None,
        "last_action": "",
        "notes": [],
        "answer": ""
    }
    
    # Stream the agent's steps
    async for event in main_agent_graph.astream(initial_state):
        if isinstance(event, dict):
            # Convert any non-serializable objects to strings
            if "parse_action" in event:
                thought = event["parse_action"]["notes"][-1]
                action = event["parse_action"]["action"]
                yield f"data: {{\n  \"type\": \"thought\",\n  \"content\": {json.dumps(thought)}\n}}\n\n"
                yield f"data: {{\n  \"type\": \"action\",\n  \"content\": {json.dumps(action)}\n}}\n\n"
            
            # Handle final answer
            if "answer_node" in event:
                answer = event["answer_node"]["answer"]
                yield f"data: {{\n  \"type\": \"final_answer\",\n  \"content\": {json.dumps(answer)}\n}}\n\n"

@app.post("/query")
async def query_agent(request: QueryRequest):
    if not browser_session["page"]:
        raise HTTPException(status_code=400, detail="Browser not initialized. Call /setup-browser first")
    
    return StreamingResponse(
        stream_agent_response(request.query, browser_session["page"]),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)