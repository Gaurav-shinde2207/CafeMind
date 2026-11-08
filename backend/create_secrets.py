import subprocess
import secrets
import string
import os
from pathlib import Path

# Load GEMINI_API_KEY from backend/.env
env_file = Path("d:/SmartCafe/backend/.env")
gemini_key = ""
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if line.startswith("GEMINI_API_KEY="):
            gemini_key = line.split("=", 1)[1].strip()

if not gemini_key:
    print("Error: GEMINI_API_KEY not found in backend/.env", flush=True)
    exit(1)

# Generate secure random DB password (alphanumeric, 24 chars)
alphabet = string.ascii_letters + string.digits
db_password = "".join(secrets.choice(alphabet) for _ in range(24))

# Save db password locally to a secure backend file for deployment reference
with open("d:/SmartCafe/backend/.db_password", "w") as f:
    f.write(db_password)

gcloud_bin = "d:/SmartCafe/google-cloud-sdk/bin/gcloud.cmd"
env = os.environ.copy()
env["CLOUDSDK_PYTHON"] = "C:/Python314/python.exe"
env["CLOUDSDK_CONFIG"] = "d:/SmartCafe/.gcloud_config"

def create_secret(secret_id, secret_data):
    # Create secret
    p1 = subprocess.run(
        [gcloud_bin, "secrets", "create", secret_id, "--replication-policy=automatic"],
        env=env,
        capture_output=True,
        text=True
    )
    # Add secret version via stdin without echoing
    p2 = subprocess.run(
        [gcloud_bin, "secrets", "versions", "add", secret_id, "--data-file=-"],
        input=secret_data,
        env=env,
        capture_output=True,
        text=True
    )
    if p2.returncode == 0:
        print(f"Secret '{secret_id}' created and version added successfully.", flush=True)
    else:
        print(f"Failed to add version to '{secret_id}': {p2.stderr}", flush=True)

create_secret("cafemind-gemini-key", gemini_key)
create_secret("cafemind-db-password", db_password)
print("Secret Manager setup complete.", flush=True)
