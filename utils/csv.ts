import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Transaction data structure from CSV
 */
export interface Transaction {
    date: string;
    amount: string;
    type: 'income' | 'expense';
    category: string;
    note: string;
}

/**
 * Parse CSV file and return array of transactions
 * @param filePath - Path to CSV file
 * @returns Array of Transaction objects
 */
export function parseCSV(filePath: string): Transaction[] {
    try {
        const fullPath = path.resolve(filePath);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            throw new Error(`CSV file not found: ${fullPath}`);
        }
        
        // Read CSV file
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        
        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            cast: (value, context) => {
                // Convert type to lowercase for consistency
                if (context.column === 'type') {
                    return value.toLowerCase().trim();
                }
                return value;
            }
        });
        
        // Validate and transform records
        const transactions: Transaction[] = records.map((record: any, index: number) => {
            // Validate required fields
            if (!record.date || !record.amount || !record.type || !record.note) {
                throw new Error(
                    `Row ${index + 2}: Missing required fields. Required: date, amount, type, note`
                );
            }
            
            // Validate type
            const type = record.type.toLowerCase().trim();
            if (type !== 'income' && type !== 'expense') {
                throw new Error(
                    `Row ${index + 2}: Invalid type "${record.type}". Must be "income" or "expense"`
                );
            }
            
            // Validate amount (should be a number)
            const amount = record.amount.trim();
            if (isNaN(parseFloat(amount))) {
                throw new Error(
                    `Row ${index + 2}: Invalid amount "${amount}". Must be a number`
                );
            }
            
            return {
                date: record.date.trim(),
                amount: amount,
                type: type as 'income' | 'expense',
                category: record.category.trim() as string,
                note: record.note.trim()
            } as Transaction;
        });
        
        console.log(`✅ Successfully parsed ${transactions.length} transactions from CSV`);
        return transactions;
        
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse CSV: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Format date string to match app's date format
 * Supports various input formats and converts to DD/MM/YYYY
 * @param dateStr - Date string in various formats
 * @returns Formatted date string
 */
export function formatDate(dateStr: string): string {
    try {
        // Try parsing different date formats
        const date = new Date(dateStr);
        
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`);
        }
        
        // Format as DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    } catch (error) {
        throw new Error(`Failed to format date "${dateStr}": ${error}`);
    }
}

