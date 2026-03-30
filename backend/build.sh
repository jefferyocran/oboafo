#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip

# Install PyTorch CPU-only first (much smaller than the default CUDA build)
pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

pip install --no-cache-dir -r requirements.txt

# Build the FAISS index from constitution.json so it's ready at startup
python -m app.services.rag --build
