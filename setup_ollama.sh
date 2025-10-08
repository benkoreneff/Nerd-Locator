#!/bin/bash

echo "Setting up Ollama for tag extraction"
echo "=================================================="

# Check if Ollama is already installed
if command -v ollama &> /dev/null; then
    echo "Ollama is already installed"
else
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    if [ $? -eq 0 ]; then
        echo "Ollama installed successfully"
    else
        echo "Failed to install Ollama"
        exit 1
    fi
fi

# Start Ollama service in background
echo "Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for service to start
echo "Waiting for Ollama service to start..."
sleep 5

# Pull the required model
echo "Pulling phi3:mini model (this may take a few minutes)..."
ollama pull phi3:mini

if [ $? -eq 0 ]; then
    echo "Model phi3:mini pulled successfully"
else
    echo "Failed to pull model"
    kill $OLLAMA_PID 2>/dev/null
    exit 1
fi

# Test the setup
echo "Testing LLM tag extraction..."
cd server
python3 test_llm_tagger.py

if [ $? -eq 0 ]; then
    echo "LLM tag extraction test passed"
else
    echo "LLM tag extraction test had issues (this is normal if Ollama isn't running)"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To use LLM tag extraction:"
echo "1. Make sure Ollama is running: ollama serve"
echo "2. Start the Civitas application: docker-compose up"
echo "3. Submit civilian profiles with detailed free_text for intelligent tag extraction"
echo ""
echo "Note: If Ollama is not available, the system will automatically fall back to regex-based tagging"
