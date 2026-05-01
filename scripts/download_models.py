
import subprocess, sys

print("Downloading spaCy model...")
subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)

from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForSeq2SeqLM

print("Downloading distilbert-base-uncased...")
AutoTokenizer.from_pretrained("distilbert-base-uncased", cache_dir=".cache/models")
AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=6, ignore_mismatched_sizes=True, cache_dir=".cache/models")

print("Downloading google/flan-t5-base...")
AutoTokenizer.from_pretrained("google/flan-t5-base", cache_dir=".cache/models")
AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base", cache_dir=".cache/models")

print("Downloading GGUF model (Ambuj-Tripathi-Indian-Legal-Llama-GGUF)...")
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id="invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF",
    filename="llama-3.2-1b-instruct.Q4_K_M.gguf",
    local_dir=".cache/models",
    local_dir_use_symlinks=False
)

print("All models ready.")
