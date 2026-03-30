#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# Build the FAISS index from constitution.json so it's ready at startup
python -m app.services.rag --build
