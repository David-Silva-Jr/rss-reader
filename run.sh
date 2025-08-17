#!/bin/bash
cd "$(dirname "$0")"

# Assumes there is a virtual environment created with venv where dependencies are installed
source env/bin/activate

python3 ReadJson.py