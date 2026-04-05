#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to convert transaction_differences.txt to transactions.csv format
"""

import csv
import re


def get_category(merchant: str) -> str:
    """
    Map merchant name to category based on rules
    """
    merchant_upper = merchant.upper()

    if "CURSOR" in merchant_upper:
        return "Internet Bill"
    elif "ＩＩＪ" in merchant or "IIJ" in merchant_upper:
        return "Phone Bill"
    elif "AMAZON" in merchant_upper:
        return "Shopping"
    elif (
        "ＥＴＣカード" in merchant
        or "ETC" in merchant_upper
        or "Ｓｕｉｃａ" in merchant
        or "SUICA" in merchant_upper
        or "ﾀｲﾑｽﾞｶ" in merchant
    ):
        return "Transportation"
    elif "楽天証券" in merchant:
        return "Investment"
    elif (
        "ｽﾎﾟ-ﾂｵ-ｿﾘﾃｲ" in merchant
        or "AIRBNB" in merchant_upper
        or "VIETJET" in merchant_upper
        or "TRAVELOKA" in merchant_upper
    ):
        return "Travel"
    elif "ﾄｳｷﾖｳﾃﾞﾝﾘﾖｸﾃﾞﾝｷﾘﾖ" in merchant:
        return "Electricity Bill"
    elif "APPLE COM" in merchant_upper:
        return "Games"
    else:
        return "Food & Beverage"


def clean_merchant(merchant: str) -> str:
    """
    Remove commas from merchant name
    """
    return merchant.replace(",", "").strip()


def parse_line(line: str):
    """
    Parse a line from transaction_differences.txt
    Format: Date: 2025-07-29, Amount: 3080.00 JPY, Enavi Row: 4, File: enavi202508(6192).csv, Merchant: CURSOR, AI POWERED I利用国US
    """
    # Extract date
    date_match = re.search(r"Date: (\d{4}-\d{2}-\d{2})", line)
    if not date_match:
        return None
    date = date_match.group(1)

    # Extract amount (remove .00 and JPY)
    amount_match = re.search(r"Amount: ([\d.]+)", line)
    if not amount_match:
        return None
    amount = amount_match.group(1).replace(".00", "").replace(".0", "")
    # Remove decimal if it's .00
    if "." in amount:
        amount = str(int(float(amount)))
    else:
        amount = amount

    # Extract merchant (everything after "Merchant: ")
    merchant_match = re.search(r"Merchant: (.+)$", line)
    if not merchant_match:
        return None
    merchant = merchant_match.group(1).strip()

    # Clean merchant (remove commas)
    merchant = clean_merchant(merchant)

    # Get category
    category = get_category(merchant)

    return {
        "date": date,
        "amount": amount,
        "type": "expense",
        "category": category,
        "note": merchant,
    }


def main():
    input_file = "transaction_differences.txt"
    output_file = "transactions.csv"

    transactions = []

    # Read input file
    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Process all lines that start with "Date:"
    for line in lines:
        line = line.strip()

        # Skip empty lines
        if not line:
            continue

        # Process lines that start with "Date:"
        if line.startswith("Date:"):
            transaction = parse_line(line)
            if transaction:
                transactions.append(transaction)

    # Sort by date
    transactions.sort(key=lambda x: x["date"])

    # Write to CSV
    with open(output_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=["date", "amount", "type", "category", "note"]
        )
        writer.writeheader()
        writer.writerows(transactions)

    print(f"✅ Converted {len(transactions)} transactions to {output_file}")


if __name__ == "__main__":
    main()
