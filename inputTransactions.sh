# !/bin/bash

# Start the Android emulator
nohup emulator -avd Pixel_4 > emulator.log 2>&1 &
adb wait-for-device
echo "Waiting for Android to finish booting..."
while [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" != "1" ]; do sleep 2; done
adb shell input keyevent 82 >/dev/null 2>&1 || true
echo "Android is ready."

adb shell monkey -p com.bookmark.money 1
sleep 10

# Run the test:export command to export transactions to google drive
npm run test:export

# Download the transaction_differences.txt file and compare the transactions and convert them to the required format
cd data
source .venv/bin/activate
pip install -r requirements.txt
python download_file.py
python compare_transactions.py
python convert_transactions.py

cd ..
# check if the data/transaction_differences.txt file is not empty then run the following command to import the transactions
if [ -s "data/transaction_differences.txt" ]; then
    npm run test:import
fi