import os
import sys
from openai import OpenAI

client = OpenAI(base_url=os.environ.get("OPENAI_BASE_URL", "http://host.docker.internal:11434/v1"),
                api_key=os.environ.get("OPENAI_API_KEY", "ollama"))

# Prompt comes from the command line if given, else a default.
prompt = sys.argv[1] if len(sys.argv) > 1 else "Explain containers in one sentence."

resp = client.chat.completions.create(
    model=os.environ.get("MODEL", "qwen3.5:2b"),
    messages=[{"role": "user", "content": prompt}])
print(resp.choices[0].message.content)
