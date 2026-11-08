import urllib.request
import zipfile
import os
import sys

URL = "https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-windows-x86_64.zip"
ZIP_PATH = "d:\\SmartCafe\\gcloud.zip"
TARGET_DIR = "d:\\SmartCafe"

print(f"Downloading Google Cloud SDK (75.5 MB) from {URL}...")
def reporthook(blocknum, blocksize, totalsize):
    read = blocknum * blocksize
    if totalsize > 0 and blocknum % 500 == 0:
        percent = read * 100 / totalsize
        print(f"Downloaded {read / (1024*1024):.1f} MB ({percent:.1f}%)", flush=True)

urllib.request.urlretrieve(URL, ZIP_PATH, reporthook)
print("Download complete. Extracting...", flush=True)

with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
    zip_ref.extractall(TARGET_DIR)

print("Extraction complete. Cleaning up zip...", flush=True)
if os.path.exists(ZIP_PATH):
    os.remove(ZIP_PATH)

print("Google Cloud SDK is successfully installed at d:\\SmartCafe\\google-cloud-sdk!")
