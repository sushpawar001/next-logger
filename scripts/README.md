# Data Encryption Migration Script

This script migrates existing unencrypted data in your database to use AES-256-GCM encryption for sensitive fields.

## ⚠️ Important Warnings

-   **ALWAYS BACKUP YOUR DATABASE** before running this migration
-   This script modifies data in-place and cannot be easily reversed
-   Test the migration on a copy of your production database first
-   Ensure your `ENCRYPTION_KEY` environment variable is properly set

## Prerequisites

1. **Database Backup**: Create a complete backup of your MongoDB database
2. **Environment Variables**: Ensure your `.env` file contains:
    ```
    MONGO_URI=your_mongodb_connection_string
    ENCRYPTION_KEY=your_32_character_encryption_key
    ```
3. **Dependencies**: Make sure all required packages are installed

## Models and Fields Being Encrypted

The migration script will encrypt the following fields:

### Glucose Model

-   `value` - Blood glucose readings
-   `tag` - Optional tags/labels

### Weight Model

-   `value` - Weight measurements
-   `tag` - Optional tags/labels

### Insulin Model

-   `units` - Insulin dosage units
-   `name` - Insulin type/name
-   `tag` - Optional tags/labels

### Measurements Model

-   `arms` - Arm circumference
-   `chest` - Chest circumference
-   `abdomen` - Abdomen circumference
-   `waist` - Waist circumference
-   `hip` - Hip circumference
-   `thighs` - Thigh circumference
-   `calves` - Calf circumference
-   `tag` - Optional tags/labels

## Available Scripts

### 1. Analyze Data (Dry Run) - RECOMMENDED FIRST STEP
Before running the actual migration, analyze your data to see what would be encrypted:

```bash
npm run migrate:analyze
```

This script will:
- Connect to your database
- Analyze all documents without modifying anything
- Show you exactly what would be encrypted
- Provide sample data and statistics
- Tell you if migration is needed

### 2. Run Migration
After analyzing and backing up your data, run the actual migration:

```bash
npm run migrate:encrypt
```

### 3. Verify Encryption
After migration, verify that encryption is working correctly:

```bash
npm run migrate:verify
```

This script will:
- Test decryption of encrypted data
- Show sample decrypted values
- Report any decryption errors
- Confirm encryption is working properly

## Running the Migration

## What the Script Does

1. **Connects** to your MongoDB database using the `MONGO_URI`
2. **Scans** each collection for documents with unencrypted sensitive fields
3. **Encrypts** each field using AES-256-GCM encryption
4. **Stores** encrypted data as JSON strings for better database compatibility
5. **Skips** fields that are already encrypted
6. **Reports** progress and statistics

## Expected Output

```
🚀 Starting data encryption migration...
⚠️  This will encrypt sensitive data in your database
⚠️  Make sure you have a backup before proceeding!

✅ Connected to MongoDB

🔄 Starting migration for glucose model...
📊 Found 150 documents in glucose
   Processed 100/150 documents...
✅ Completed migration for glucose:
   - Processed: 150 documents
   - Encrypted: 300 fields
   - Skipped: 0 fields (already encrypted)
   - Errors: 0 documents

🔄 Starting migration for weight model...
📊 Found 75 documents in weight
✅ Completed migration for weight:
   - Processed: 75 documents
   - Encrypted: 150 fields
   - Skipped: 0 fields (already encrypted)
   - Errors: 0 documents

...

🎉 Migration completed!
📊 Summary:
   - Total documents processed: 500
   - Total fields encrypted: 1200
   - Total fields skipped: 0
   - Total errors: 0
   - Duration: 15.23 seconds

✅ All data successfully encrypted!
✅ Disconnected from MongoDB
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Check your `MONGO_URI` environment variable
2. **Encryption Key Error**: Ensure `ENCRYPTION_KEY` is at least 32 characters long
3. **Permission Error**: Make sure your MongoDB user has write permissions
4. **Memory Issues**: For large databases, the script processes documents in batches

### Error Handling

-   The script will continue processing even if individual documents fail
-   Failed documents are logged with their IDs for manual review
-   The script provides a summary of all errors at the end

## Verification

After running the migration:

1. **Check a few documents** in your database to ensure fields are encrypted
2. **Test your application** to ensure it can read the encrypted data
3. **Verify decryption** works correctly in your application

## Rollback (If Needed)

If you need to rollback the migration:

1. **Restore from backup** (recommended)
2. **Or** create a decryption script (not provided - would need to be custom-built)

## Security Notes

-   The encryption key should be stored securely and never committed to version control
-   Consider using a key management service for production environments
-   Regularly rotate your encryption keys
-   Monitor for any decryption errors in your application logs

## Support

If you encounter issues:

1. Check the error logs in the console output
2. Verify your environment variables are correct
3. Ensure your database connection is working
4. Test with a small subset of data first
