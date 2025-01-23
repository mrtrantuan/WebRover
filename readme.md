# WebRover

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-121212?style=for-the-badge&logo=chainlink&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" />
  <img src="https://img.shields.io/badge/LangGraph-FF6B6B?style=for-the-badge&logo=graph&logoColor=white" />
  <img src="https://img.shields.io/badge/Pillow-3776AB?style=for-the-badge&logo=python&logoColor=white" />

  <h3>Your AI Co-pilot for Web Navigation 🚀</h3>

  <p align="center">
    <b>Autonomous Web Agent | Task Automation | Information Retrieval</b>
  </p>
</div>


## Overview

WebRover is an autonomous AI agent designed to interpret user input and execute actions by interacting with web elements to accomplish tasks or answer questions. It leverages advanced language models and web automation tools to navigate the web, gather information, and provide structured responses based on the user's needs.

## Motivation

In today's digital landscape, users spend significant time performing repetitive web-based tasks like research, data gathering, and information synthesis. WebRover aims to automate these tasks by combining the power of large language models with web automation capabilities, allowing users to focus on higher-level decision making while the agent handles the manual browsing work.

## Architecture

![Agent Architecture Diagram](agent_diagram.png)

WebRover uses a state-based architecture powered by LangGraph to manage the flow of operations:

### Core Components

1. **State Management**: Uses LangGraph to maintain agent state and control flow between different actions
2. **Language Model Integration**: Leverages OpenAI's GPT models for:
   - Creating master plans for tasks
   - Deciding next actions based on web page content
   - Generating final responses

3. **Web Automation**: Uses Playwright for browser automation and interaction

### Agent Tools

The agent comes equipped with several tools to interact with web pages:

- **Click**: Simulates mouse clicks on web elements
- **Type**: Enters text into input fields
- **Scroll**: Navigates through pages (supports both regular pages and PDFs)
- **Wait**: Adds delays to ensure page loading
- **GoBack**: Returns to previous pages
- **GoToSearchEngine**: Redirects to Google for new searches

### How It Works

1. **Task Planning**: When given a task, the agent first creates a master plan using the LLM

2. **Page Analysis**: For each page, the agent:
   - Captures a screenshot
   - Identifies interactive elements
   - Creates bounding boxes around elements
   - Assigns numerical labels for reference

3. **Decision Making**: The agent:
   - Analyzes the current page state
   - Compares against the master plan
   - Decides on the next action
   - Executes the chosen tool

4. **Response Generation**: After gathering necessary information, generates a structured response with:
   - Steps taken to complete the task
   - Final answer or result

## Setup

1. Clone the repository
2. Create a virtual environment
3. Install dependencies:
    ```
    bash
    pip install -r requirements.txt
    ```

4. Set up environment variables in `.env`:
    ```
    bash
    OPENAI_API_KEY="your_openai_api_key"
    ```
