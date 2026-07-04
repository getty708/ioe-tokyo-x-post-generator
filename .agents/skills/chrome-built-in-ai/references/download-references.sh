#!/bin/bash
set -e

# Navigate to the directory where this script is located
cd "$(dirname "$0")"

echo "Downloading original reference repositories..."

# 1. zero-knowledge-pitch-builder
if [ ! -d "zero-knowledge-pitch-builder" ]; then
  git clone https://github.com/yoichiro/zero-knowledge-pitch-builder.git
else
  echo "zero-knowledge-pitch-builder already exists, skipping."
fi

# 2. builtin-ai-api-status
if [ ! -d "builtin-ai-api-status" ]; then
  git clone https://github.com/yoichiro/builtin-ai-api-status.git
else
  echo "builtin-ai-api-status already exists, skipping."
fi

# 3. demo-dashboard
if [ ! -d "demo-dashboard" ]; then
  git clone https://github.com/GoogleChromeLabs/web-ai-demos.git demo-dashboard
else
  echo "demo-dashboard already exists, skipping."
fi

# 4. insite-pagebot
if [ ! -d "insite-pagebot" ]; then
  git clone https://github.com/michaelwasserman/ai-examples.git insite-pagebot
else
  echo "insite-pagebot already exists, skipping."
fi

# 5. chrome-extension
if [ ! -d "chrome-extension" ]; then
  git clone https://github.com/satetsu888/simple-oauth2-client-extension.git chrome-extension
else
  echo "chrome-extension already exists, skipping."
fi

echo "Done downloading reference repositories!"
