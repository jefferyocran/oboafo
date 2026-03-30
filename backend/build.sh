#!/usr/bin/env bash
set -o errexit

# Install PyTorch CPU-only first (much smaller than the default CUDA build)
pip install torch --index-url https://download.pytorch.org/whl/cpu

pip install -r requirements.txt

# Build the FAISS index from constitution.json so it's ready at startup
python -m app.services.rag --build
