from google_auth_oauthlib.flow import InstalledAppFlow
import pickle
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
import os
import pickle

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]

creds = None

if os.path.exists("token.pickle"):
    with open("token.pickle", "rb") as f:
        creds = pickle.load(f)

# Nếu chưa có hoặc token hết hạn
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())          # tự refresh
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)

    with open("token.pickle", "wb") as f:
        pickle.dump(creds, f)

service = build("drive", "v3", credentials=creds)

results = service.files().list(
    q="name contains 'Money Lover'",
    orderBy="modifiedTime desc",
    pageSize=1,
    fields="files(id,name,mimeType,modifiedTime)"
).execute()

file = results["files"][0]
print(file)

request = service.files().export_media(
    fileId=file["id"],
    mimeType="text/csv"
)

downloaded_file = "csv/MoneyLoverTransactions.csv"
fh = io.FileIO(
    downloaded_file,
    "wb"
)

downloader = MediaIoBaseDownload(fh, request)

done = False
while not done:
    status, done = downloader.next_chunk()

print(f"Download complete! File saved as {downloaded_file}")