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

# Global queue for browser events
browser_events = asyncio.Queue()

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

async def emit_browser_event(event_type: str, data: Dict[str, Any]):
    await browser_events.put({
        "type": event_type,
        "data": data
    })

@app.get("/browser-events")
async def browser_events_endpoint():
    async def event_generator():
        while True:
            try:
                event = await browser_events.get()
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.CancelledError:
                break
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

async def stream_agent_response(query: str, page):
    try:
        # Emit initial loading state
        await emit_browser_event("status", {"status": "loading"})
        
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
        
        async for event in main_agent_graph.astream(initial_state):
            if isinstance(event, dict):
                # Handle page actions
                if "parse_action" in event:
                    action = event["parse_action"]["action"]
                    thought = event["parse_action"]["notes"][-1]
                    
                    # Emit thought
                    yield f"data: {{\n  \"type\": \"thought\",\n  \"content\": {json.dumps(thought)}\n}}\n\n"
                    
                    # Handle different action types
                    if isinstance(action, dict):
                        action_type = action.get("action", "")
                        
                        # Emit browser status for navigation actions
                        if action_type == "goto":
                            await emit_browser_event("navigation", {
                                "url": action["args"],
                                "status": "loading"
                            })
                        elif action_type in ["click", "type", "scroll"]:
                            await emit_browser_event("interaction", {
                                "type": action_type,
                                "args": action.get("args", "")
                            })
                    
                    # Emit action for frontend
                    yield f"data: {{\n  \"type\": \"action\",\n  \"content\": {json.dumps(action)}\n}}\n\n"
                
                # Handle final answer
                if "answer_node" in event:
                    answer = event["answer_node"]["answer"]
                    yield f"data: {{\n  \"type\": \"final_answer\",\n  \"content\": {json.dumps(answer)}\n}}\n\n"
                    
                # Emit completion status
                await emit_browser_event("status", {"status": "complete"})
                
    except Exception as e:
        # Handle errors
        error_message = str(e)
        yield f"data: {{\n  \"type\": \"error\",\n  \"content\": {json.dumps(error_message)}\n}}\n\n"
        await emit_browser_event("status", {"status": "error", "message": error_message})

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