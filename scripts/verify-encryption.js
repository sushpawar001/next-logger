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

// Decrypt function
function decrypt(encryptedData) {
    try {
        if (
            !encryptedData ||
            !encryptedData.encrypted ||
            !encryptedData.iv ||
            !encryptedData.tag
        ) {
            return {
                success: false,
                error: "Invalid encrypted data structure",
            };
        }

        const key = getEncryptionKey();
        const iv = Buffer.from(encryptedData.iv, "hex");
        const tag = Buffer.from(encryptedData.tag, "hex");
        const encrypted = Buffer.from(encryptedData.encrypted, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, undefined, "utf8");
        decrypted += decipher.final("utf8");

        return {
            success: true,
            data: decrypted,
        };
    } catch (error) {
        return {
            success: false,
            error: `Decryption failed: ${error.message}`,
        };
    }
}

// Check if data is encrypted
function isEncryptedData(value) {
    return (
        value &&
        typeof value === "object" &&
        typeof value.encrypted === "string" &&
        typeof value.iv === "string" &&
        typeof value.tag === "string"
    );
}

// Decrypt from string (JSON format)
function decryptFromString(encryptedString) {
    try {
        if (!encryptedString || typeof encryptedString !== "string") {
            return { success: false, error: "Invalid encrypted string" };
        }

        const encryptedData = JSON.parse(encryptedString);

        if (!isEncryptedData(encryptedData)) {
            return {
                success: false,
                error: "Invalid encrypted data structure",
            };
        }

        return decrypt(encryptedData);
    } catch (error) {
        return {
            success: false,
            error: `Failed to parse encrypted string: ${error.message}`,
        };
    }
}

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

// Check if a value is encrypted
function isEncryptedString(value) {
    if (typeof value !== "string") return false;
    try {
        const parsed = JSON.parse(value);
        return isEncryptedData(parsed);
    } catch (error) {
        return false;
    }
}

// Verify a single model
async function verifyModel(modelName, collectionName, fields) {
    console.log(`\n🔍 Verifying ${modelName} model...`);

    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    let totalDocuments = 0;
    let encryptedFields = 0;
    let decryptionErrors = 0;
    let sampleDecrypted = [];

    try {
        // Get a sample of documents (limit to 100 for performance)
        const documents = await collection.find({}).limit(100).toArray();
        totalDocuments = documents.length;
        console.log(`📊 Found ${totalDocuments} documents to verify`);

        if (totalDocuments === 0) {
            console.log(`⏭️  No documents to verify for ${modelName}`);
            return { totalDocuments, encryptedFields, decryptionErrors, sampleDecrypted };
        }

        // Check each document
        for (const doc of documents) {
            for (const field of fields) {
                if (doc[field] !== undefined && doc[field] !== null) {
                    if (isEncryptedString(doc[field])) {
                        encryptedFields++;

                        // Try to decrypt
                        try {
                            const decryptionResult = decryptFromString(doc[field]);
                            if (decryptionResult.success) {
                                // Store sample decrypted data (first 3)
                                if (sampleDecrypted.length < 3) {
                                    sampleDecrypted.push({
                                        documentId: doc._id,
                                        field,
                                        decryptedValue: decryptionResult.data
                                    });
                                }
                            } else {
                                decryptionErrors++;
                                console.error(`❌ Decryption failed for document ${doc._id}, field ${field}: ${decryptionResult.error}`);
                            }
                        } catch (error) {
                            decryptionErrors++;
                            console.error(`❌ Decryption error for document ${doc._id}, field ${field}:`, error.message);
                        }
                    } else {
                        console.log(`⚠️  Field ${field} in document ${doc._id} is not encrypted`);
                    }
                }
            }
        }

        console.log(`📈 Verification for ${modelName}:`);
        console.log(`   - Total documents checked: ${totalDocuments}`);
        console.log(`   - Encrypted fields found: ${encryptedFields}`);
        console.log(`   - Decryption errors: ${decryptionErrors}`);

        if (sampleDecrypted.length > 0) {
            console.log(`   - Sample decrypted data:`);
            sampleDecrypted.forEach((sample, index) => {
                console.log(`     ${index + 1}. Document ${sample.documentId} - ${sample.field}: ${sample.decryptedValue}`);
            });
        }

        return { totalDocuments, encryptedFields, decryptionErrors, sampleDecrypted };

    } catch (error) {
        console.error(`❌ Error verifying ${modelName}:`, error);
        return { totalDocuments, encryptedFields, decryptionErrors, sampleDecrypted };
    }
}

// Main verification function
async function runVerification() {
    console.log('🔍 Starting encryption verification...');
    console.log('This will test decryption of encrypted data\n');

    const startTime = Date.now();
    let totalDocuments = 0;
    let totalEncryptedFields = 0;
    let totalDecryptionErrors = 0;

    const modelsToVerify = {
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

    try {
        // Connect to database
        await connectDB();

        // Verify each model
        for (const [modelName, config] of Object.entries(modelsToVerify)) {
            const result = await verifyModel(modelName, config.collection, config.fields);
            totalDocuments += result.totalDocuments;
            totalEncryptedFields += result.encryptedFields;
            totalDecryptionErrors += result.decryptionErrors;
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n📊 VERIFICATION SUMMARY:');
        console.log('='.repeat(50));
        console.log(`   - Total documents checked: ${totalDocuments}`);
        console.log(`   - Total encrypted fields: ${totalEncryptedFields}`);
        console.log(`   - Total decryption errors: ${totalDecryptionErrors}`);
        console.log(`   - Verification duration: ${duration} seconds`);

        if (totalDecryptionErrors === 0) {
            console.log('\n✅ All encrypted data verified successfully!');
            console.log('   Encryption and decryption are working correctly.');
        } else {
            console.log('\n⚠️  Some decryption errors were found:');
            console.log(`   - ${totalDecryptionErrors} fields failed to decrypt`);
            console.log('   Check the error logs above for details.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await disconnectDB();
    }
}

// Run the verification if this script is executed directly
if (require.main === module) {
    runVerification().catch(console.error);
}

module.exports = {
    runVerification,
    verifyModel,
    isEncryptedString
}; 