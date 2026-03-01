#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to compare MoneyLoverTransactions.csv with enavi CSV files by month and year.
Compares dates and amounts (handling sign differences and multiple transactions).
"""

import csv
import os
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Set, Tuple


def parse_transactions_csv(filename: str) -> Dict[str, List[Tuple[str, float, int]]]:
    """
    Parse MoneyLoverTransactions.csv and group by month.
    Returns: {month_key: [(date_str, abs_amount, id)]}
    month_key format: "YYYY-MM"
    """
    transactions_by_month = defaultdict(list)

    with open(filename, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            try:
                # Parse date: DD/MM/YYYY
                date_str = row["Date"].strip()
                date_obj = datetime.strptime(date_str, "%d/%m/%Y")
                month_key = date_obj.strftime("%Y-%m")

                # Parse amount (negative for expenses)
                amount = float(row["Amount"].strip())
                abs_amount = abs(amount)

                # Only process expenses (negative amounts) - skip incoming transfers
                if amount < 0:
                    transaction_id = row["Id"].strip()
                    transactions_by_month[month_key].append(
                        (date_obj.strftime("%Y-%m-%d"), abs_amount, transaction_id)
                    )
            except (ValueError, KeyError) as e:
                print(f"Warning: Skipping row due to error: {e}")
                continue

    return dict(transactions_by_month)


def parse_enavi_csv(filename: str) -> Dict[str, List[Tuple[str, float, int, str]]]:
    """
    Parse enavi CSV file and group by date.
    Returns: {date_str: [(amount, row_index, filename, merchant_name)]}
    date_str format: "YYYY-MM-DD"
    """
    transactions_by_date = defaultdict(list)

    with open(filename, "r", encoding="utf-8-sig") as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for idx, row in enumerate(
            reader, start=2
        ):  # Start at 2 because row 1 is header
            try:
                # if date_key_name === "分割2回払い(2回目)" then continue
                # Find amount column
                paymethod_key_name = None
                for key in row.keys():
                    if "支払方法" in key:
                        paymethod_key_name = key
                        break

                if row[paymethod_key_name] == "分割2回払い(2回目)":
                    continue

                # Find date column (handle BOM and quotes)
                date_key_name = None
                for key in row.keys():
                    if "利用日" in key:
                        date_key_name = key
                        break

                if not date_key_name:
                    continue

                # Parse date: YYYY/MM/DD (may have quotes)
                date_str = row[date_key_name].strip().strip('"').strip("'")
                if (
                    not date_str
                    or date_str.startswith("現地利用額")
                    or "利用日" in date_str
                ):
                    continue

                date_obj = datetime.strptime(date_str, "%Y/%m/%d")
                date_key = date_obj.strftime("%Y-%m-%d")

                # Find amount column
                amount_key_name = None
                for key in row.keys():
                    if "利用金額" in key:
                        amount_key_name = key
                        break

                if not amount_key_name:
                    continue

                # Parse amount (may have quotes)
                amount_str = row[amount_key_name].strip().strip('"').strip("'")
                amount = float(amount_str)

                # Find merchant name column (利用店名・商品名)
                merchant_key_name = None
                for key in row.keys():
                    if "利用店名" in key or "商品名" in key:
                        merchant_key_name = key
                        break

                merchant_name = ""
                if merchant_key_name:
                    merchant_name = row[merchant_key_name].strip().strip('"').strip("'")

                transactions_by_date[date_key].append(
                    (amount, idx, filename, merchant_name)
                )
            except (ValueError, KeyError) as e:
                # Skip invalid rows
                continue

    return dict(transactions_by_date)


def compare_transactions(
    transactions: List[Tuple[str, float, int]],
    enavi_transactions: Dict[str, List[Tuple[float, int, str, str]]],
) -> Tuple[List[Tuple], List[Tuple], Dict[str, int]]:
    """
    Compare transactions from MoneyLoverTransactions.csv with enavi transactions.
    Returns: (missing_in_enavi, missing_in_transactions, matched_counts)
    """
    missing_in_enavi = []
    missing_in_transactions = []
    matched_counts = defaultdict(int)

    # Count transactions by (date, amount) in MoneyLoverTransactions.csv
    trans_counts = defaultdict(int)
    trans_details = defaultdict(list)
    for date, amount, trans_id in transactions:
        key = (date, amount)
        trans_counts[key] += 1
        trans_details[key].append((date, amount, trans_id))

    # Count transactions by (date, amount) in enavi file
    enavi_counts = defaultdict(int)
    enavi_details = defaultdict(list)
    for date, amounts_list in enavi_transactions.items():
        for amount, row_idx, filename, merchant_name in amounts_list:
            key = (date, amount)
            enavi_counts[key] += 1
            enavi_details[key].append((date, amount, row_idx, filename, merchant_name))

    # Find transactions in MoneyLoverTransactions.csv that are missing in enavi
    for (date, amount), count in trans_counts.items():
        enavi_count = enavi_counts.get((date, amount), 0)
        if enavi_count < count:
            missing_count = count - enavi_count
            for detail in trans_details[(date, amount)][:missing_count]:
                missing_in_enavi.append(detail)
        else:
            # Mark as matched
            matched_counts[(date, amount)] = min(count, enavi_count)

    # Find transactions in enavi that are missing in MoneyLoverTransactions.csv
    for (date, amount), count in enavi_counts.items():
        trans_count = trans_counts.get((date, amount), 0)
        if trans_count < count:
            missing_count = count - trans_count
            for detail in enavi_details[(date, amount)][:missing_count]:
                missing_in_transactions.append(detail)

    return missing_in_enavi, missing_in_transactions, matched_counts


def format_month_name(month_key: str) -> str:
    """Convert YYYY-MM to readable format"""
    year, month = month_key.split("-")
    month_names = {
        "01": "January",
        "02": "February",
        "03": "March",
        "04": "April",
        "05": "May",
        "06": "June",
        "07": "July",
        "08": "August",
        "09": "September",
        "10": "October",
        "11": "November",
        "12": "December",
    }
    return f"{month_names[month]} {year}"


def main(
    input_folder: str, input_ml_file: str, output_file: str, output_full_file: str
):
    # Parse MoneyLoverTransactions.csv
    print("Reading MoneyLoverTransactions.csv...")
    transactions_by_month = parse_transactions_csv(input_ml_file)
    print(f"Found transactions in {len(transactions_by_month)} months\n")

    # Get all enavi files and parse them
    print("Reading all Enavi files... in folder", input_folder)
    enavi_files = sorted(
        [
            f
            for f in os.listdir(input_folder)
            if f.startswith("enavi") and f.endswith(".csv")
        ]
    )

    # Combine all enavi transactions by actual transaction date
    all_enavi_transactions = defaultdict(list)
    for enavi_file in enavi_files:
        enavi_data = parse_enavi_csv(f"{input_folder}/{enavi_file}")
        for date, amounts_list in enavi_data.items():
            all_enavi_transactions[date].extend(amounts_list)

    print(
        f"Found transactions in {len(all_enavi_transactions)} unique dates across all Enavi files\n"
    )

    all_missing_in_enavi = []
    all_missing_in_transactions = []
    total_matched = 0

    # Compare each month
    for month_key in sorted(transactions_by_month.keys()):
        transactions = transactions_by_month[month_key]

        # Filter enavi transactions for this month
        # Get date range for this month
        year, month = month_key.split("-")
        month_start_date = datetime.strptime(f"{year}-{month}-01", "%Y-%m-%d")

        # Calculate last day of month
        if month == "12":
            next_month_start = datetime.strptime(f"{int(year)+1}-01-01", "%Y-%m-%d")
        else:
            next_month = int(month) + 1
            next_month_start = datetime.strptime(
                f"{year}-{next_month:02d}-01", "%Y-%m-%d"
            )

        month_enavi_transactions = {}
        for date_str, amounts_list in all_enavi_transactions.items():
            try:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                if month_start_date <= date_obj < next_month_start:
                    month_enavi_transactions[date_str] = amounts_list
            except ValueError:
                continue

        print(f"📅 {format_month_name(month_key)}")
        print(f"   MoneyLoverTransactions.csv: {len(transactions)} transactions")

        enavi_count = sum(len(amounts) for amounts in month_enavi_transactions.values())
        print(f"   Enavi files: {enavi_count} transactions")

        # Compare
        missing_in_enavi, missing_in_transactions, matched = compare_transactions(
            transactions, month_enavi_transactions
        )

        matched_count = sum(matched.values())
        total_matched += matched_count

        print(f"   ✅ Matched: {matched_count} transactions")

        if missing_in_enavi:
            print(f"   ❌ Missing in Enavi ({len(missing_in_enavi)} transactions):")
            for date, amount, trans_id in missing_in_enavi[:10]:  # Show first 10
                print(f"      - Date: {date}, Amount: {amount:.2f} JPY, ID: {trans_id}")
            if len(missing_in_enavi) > 10:
                print(f"      ... and {len(missing_in_enavi) - 10} more")
            all_missing_in_enavi.extend(missing_in_enavi)

        if missing_in_transactions:
            print(
                f"   ⚠️  Extra in Enavi ({len(missing_in_transactions)} transactions):"
            )
            for detail in missing_in_transactions[:10]:  # Show first 10
                if len(detail) == 5:
                    date, amount, row_idx, filename, merchant_name = detail
                    print(
                        f"      - Date: {date}, Amount: {amount:.2f} JPY, Row: {row_idx}, File: {filename}, Merchant: {merchant_name}"
                    )
                elif len(detail) == 4:
                    date, amount, row_idx, filename = detail
                    print(
                        f"      - Date: {date}, Amount: {amount:.2f} JPY, Row: {row_idx}, File: {filename}"
                    )
                else:
                    date, amount, row_idx = detail
                    print(
                        f"      - Date: {date}, Amount: {amount:.2f} JPY, Row: {row_idx}"
                    )
            if len(missing_in_transactions) > 10:
                print(f"      ... and {len(missing_in_transactions) - 10} more")
            all_missing_in_transactions.extend(missing_in_transactions)

        print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total months processed: {len(transactions_by_month)}")
    print(f"Total matched transactions: {total_matched}")
    print(f"Total missing in Enavi files: {len(all_missing_in_enavi)}")
    print(f"Total extra in Enavi files: {len(all_missing_in_transactions)}")

    # Write detailed differences to file
    if all_missing_in_enavi or all_missing_in_transactions:
        with open(output_full_file, "w", encoding="utf-8") as f:
            f.write("TRANSACTIONS MISSING IN ENAVI FILES\n")
            f.write("=" * 70 + "\n")
            for date, amount, trans_id in all_missing_in_enavi:
                f.write(
                    f"Date: {date}, Amount: {amount:.2f} JPY, Transaction ID: {trans_id}\n"
                )

            f.write("\n\nTRANSACTIONS EXTRA IN ENAVI FILES\n")
            f.write("=" * 70 + "\n")
            for detail in all_missing_in_transactions:
                if len(detail) == 5:
                    date, amount, row_idx, filename, merchant_name = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}, File: {filename}, Merchant: {merchant_name}\n"
                    )
                elif len(detail) == 4:
                    date, amount, row_idx, filename = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}, File: {filename}\n"
                    )
                else:
                    date, amount, row_idx = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}\n"
                    )

        print(
            f"\n📄 Detailed differences written to: data/csv/transaction_differences.txt"
        )

    # Write detailed differences to file
    if all_missing_in_enavi or all_missing_in_transactions:
        with open(output_file, "w", encoding="utf-8") as f:
            for detail in all_missing_in_transactions:
                if len(detail) == 5:
                    date, amount, row_idx, filename, merchant_name = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}, File: {filename}, Merchant: {merchant_name}\n"
                    )
                elif len(detail) == 4:
                    date, amount, row_idx, filename = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}, File: {filename}\n"
                    )
                else:
                    date, amount, row_idx = detail
                    f.write(
                        f"Date: {date}, Amount: {amount:.2f} JPY, Enavi Row: {row_idx}\n"
                    )

        print(f"\n📄 Detailed differences written to: data/transaction_differences.txt")


if __name__ == "__main__":
    input_folder = "csv"
    input_ml_file = "csv/MoneyLoverTransactions.csv"
    output_file = "transaction_differences.txt"
    output_full_file = "csv/transaction_differences_full.txt"
    main(input_folder, input_ml_file, output_file, output_full_file)
