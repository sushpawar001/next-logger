const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-fallback-encryption-key-32-chars-long";

// Ensure the key is exactly 32 bytes (256 bits)
const getEncryptionKey = () => {
    const key = ENCRYPTION_KEY.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH);
    return Buffer.from(key, "utf8");
};

// Encryption function
function encrypt(text) {
    try {
        if (!text) {
            return { success: false, error: "No text provided for encryption" };
        }

        const key = getEncryptionKey();
        const iv = crypto.randomBytes(12); // GCM uses 12 bytes for IV
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const tag = cipher.getAuthTag();

        return {
            success: true,
            data: {
                encrypted,
                iv: iv.toString("hex"),
                tag: tag.toString("hex"),
            },
        };
    } catch (error) {
        return {
            success: false,
            error: `Encryption failed: ${error.message}`,
        };
    }
}

// Check if data is already encrypted
function isEncryptedData(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.encrypted === "string" &&
        typeof value.iv === "string" &&
        typeof value.tag === "string"
    );
}

// Check if data is stored as encrypted string
function isEncryptedString(value) {
    if (typeof value !== "string") return false;
    try {
        const parsed = JSON.parse(value);
        return isEncryptedData(parsed);
    } catch (error) {
        return false;
    }
}

// Convert value to string for encryption
function valueToString(value) {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
    } else if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        value instanceof Date
    ) {
        return value.toString();
    } else {
        return String(value);
    }
}

// Encrypt a single value
function encryptValue(value) {
    if (value === null || value === undefined) {
        return value;
    }

    // Skip if already encrypted
    if (isEncryptedData(value) || isEncryptedString(value)) {
        return value;
    }

    const stringValue = valueToString(value);
    const encryptionResult = encrypt(stringValue);

    if (!encryptionResult.success) {
        throw new Error(encryptionResult.error);
    }

    // Store as JSON string for better compatibility
    return JSON.stringify(encryptionResult.data);
}

// Migration configuration for each model
const migrationConfig = {
    glucose: {
        fields: ["value", "tag"],
        collection: "glucoses"
    },
    weight: {
        fields: ["value", "tag"],
        collection: "weights"
    },
    insulin: {
        fields: ["units", "name", "tag"],
        collection: "insulins"
    },
    measurement: {
        fields: ["arms", "chest", "abdomen", "waist", "hip", "thighs", "calves", "tag"],
        collection: "measurements"
    }
};

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Disconnect from MongoDB
async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
}

// Migrate a single model
async function migrateModel(modelName, config) {
    console.log(`\n🔄 Starting migration for ${modelName} model...`);

    const db = mongoose.connection.db;
    const collection = db.collection(config.collection);

    let processed = 0;
    let encrypted = 0;
    let skipped = 0;
    let errors = 0;

    try {
        // Get all documents
        const documents = await collection.find({}).toArray();
        console.log(`📊 Found ${documents.length} documents in ${modelName}`);

        if (documents.length === 0) {
            console.log(`⏭️  No documents to migrate for ${modelName}`);
            return { processed, encrypted, skipped, errors };
        }

        // Process each document
        for (const doc of documents) {
            processed++;

            try {
                let hasChanges = false;
                const updateData = {};

                // Check each field that needs encryption
                for (const field of config.fields) {
                    if (doc[field] !== undefined && doc[field] !== null) {
                        // Skip if already encrypted
                        if (isEncryptedData(doc[field]) || isEncryptedString(doc[field])) {
                            skipped++;
                            continue;
                        }

                        // Encrypt the field
                        const encryptedValue = encryptValue(doc[field]);
                        if (encryptedValue !== doc[field]) {
                            updateData[field] = encryptedValue;
                            hasChanges = true;
                            encrypted++;
                        }
                    }
                }

                // Update document if there are changes
                if (hasChanges) {
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: updateData }
                    );

                    if (processed % 100 === 0) {
                        console.log(`   Processed ${processed}/${documents.length} documents...`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing document ${doc._id}:`, error.message);
                errors++;
            }
        }

        console.log(`✅ Completed migration for ${modelName}:`);
        console.log(`   - Processed: ${processed} documents`);
        console.log(`   - Encrypted: ${encrypted} fields`);
        console.log(`   - Skipped: ${skipped} fields (already encrypted)`);
        console.log(`   - Errors: ${errors} documents`);

        return { processed, encrypted, skipped, errors };

    } catch (error) {
        console.error(`❌ Error migrating ${modelName}:`, error);
        return { processed, encrypted, skipped, errors: errors + 1 };
    }
}

// Main migration function
async function runMigration() {
    console.log('🚀 Starting data encryption migration...');
    console.log('⚠️  This will encrypt sensitive data in your database');
    console.log('⚠️  Make sure you have a backup before proceeding!\n');

    const startTime = Date.now();
    let totalProcessed = 0;
    let totalEncrypted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    try {
        // Connect to database
        await connectDB();

        // Migrate each model
        for (const [modelName, config] of Object.entries(migrationConfig)) {
            const result = await migrateModel(modelName, config);
            totalProcessed += result.processed;
            totalEncrypted += result.encrypted;
            totalSkipped += result.skipped;
            totalErrors += result.errors;
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n🎉 Migration completed!');
        console.log('📊 Summary:');
        console.log(`   - Total documents processed: ${totalProcessed}`);
        console.log(`   - Total fields encrypted: ${totalEncrypted}`);
        console.log(`   - Total fields skipped: ${totalSkipped}`);
        console.log(`   - Total errors: ${totalErrors}`);
        console.log(`   - Duration: ${duration} seconds`);

        if (totalErrors > 0) {
            console.log('\n⚠️  Some errors occurred during migration. Check the logs above.');
        } else {
            console.log('\n✅ All data successfully encrypted!');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await disconnectDB();
    }
}

// Run the migration if this script is executed directly
if (require.main === module) {
    runMigration().catch(console.error);
}

module.exports = {
    runMigration,
    migrateModel,
    encryptValue,
    isEncryptedData,
    isEncryptedString
}; 