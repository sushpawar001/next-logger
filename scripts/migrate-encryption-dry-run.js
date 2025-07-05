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

console.log("ENCRYPTION_KEY", process.env.ENCRYPTION_KEY);

// Ensure the key is exactly 32 bytes (256 bits)
const getEncryptionKey = () => {
    const key = ENCRYPTION_KEY.padEnd(KEY_LENGTH, "0").slice(0, KEY_LENGTH);
    return Buffer.from(key, "utf8");
};

// Encryption function (for testing)
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

// Test encryption without saving
function testEncryptValue(value) {
    if (value === null || value === undefined) {
        return { wouldEncrypt: false, reason: "null/undefined value" };
    }

    // Skip if already encrypted
    if (isEncryptedData(value) || isEncryptedString(value)) {
        return { wouldEncrypt: false, reason: "already encrypted" };
    }

    const stringValue = valueToString(value);
    const encryptionResult = encrypt(stringValue);

    if (!encryptionResult.success) {
        return { wouldEncrypt: false, reason: `encryption failed: ${encryptionResult.error}` };
    }

    return {
        wouldEncrypt: true,
        originalValue: value,
        originalType: typeof value,
        encryptedSize: JSON.stringify(encryptionResult.data).length
    };
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

// Analyze a single model (dry run)
async function analyzeModel(modelName, config) {
    console.log(`\n🔍 Analyzing ${modelName} model...`);

    const db = mongoose.connection.db;
    const collection = db.collection(config.collection);

    let totalDocuments = 0;
    let documentsToEncrypt = 0;
    let fieldsToEncrypt = 0;
    let alreadyEncrypted = 0;
    let sampleData = [];

    try {
        // Get all documents
        const documents = await collection.find({}).toArray();
        totalDocuments = documents.length;
        console.log(`📊 Found ${totalDocuments} documents in ${modelName}`);

        if (totalDocuments === 0) {
            console.log(`⏭️  No documents to analyze for ${modelName}`);
            return { totalDocuments, documentsToEncrypt, fieldsToEncrypt, alreadyEncrypted, sampleData };
        }

        // Analyze each document
        for (const doc of documents) {
            let docHasUnencryptedFields = false;
            let docFieldsToEncrypt = 0;
            let docAlreadyEncrypted = 0;

            // Check each field that needs encryption
            for (const field of config.fields) {
                if (doc[field] !== undefined && doc[field] !== null) {
                    const testResult = testEncryptValue(doc[field]);

                    if (testResult.wouldEncrypt) {
                        docHasUnencryptedFields = true;
                        docFieldsToEncrypt++;
                        fieldsToEncrypt++;

                        // Store sample data (first 5 documents with unencrypted fields)
                        if (sampleData.length < 5) {
                            sampleData.push({
                                documentId: doc._id,
                                field,
                                originalValue: testResult.originalValue,
                                originalType: testResult.originalType,
                                encryptedSize: testResult.encryptedSize
                            });
                        }
                    } else {
                        docAlreadyEncrypted++;
                        alreadyEncrypted++;
                    }
                }
            }

            if (docHasUnencryptedFields) {
                documentsToEncrypt++;
            }
        }

        console.log(`📈 Analysis for ${modelName}:`);
        console.log(`   - Total documents: ${totalDocuments}`);
        console.log(`   - Documents with unencrypted fields: ${documentsToEncrypt}`);
        console.log(`   - Fields to encrypt: ${fieldsToEncrypt}`);
        console.log(`   - Fields already encrypted: ${alreadyEncrypted}`);

        if (sampleData.length > 0) {
            console.log(`   - Sample unencrypted data:`);
            sampleData.forEach((sample, index) => {
                console.log(`     ${index + 1}. Document ${sample.documentId} - ${sample.field}:`);
                console.log(`        Type: ${sample.originalType}, Value: ${sample.originalValue}`);
                console.log(`        Encrypted size would be: ${sample.encryptedSize} characters`);
            });
        }

        return { totalDocuments, documentsToEncrypt, fieldsToEncrypt, alreadyEncrypted, sampleData };

    } catch (error) {
        console.error(`❌ Error analyzing ${modelName}:`, error);
        return { totalDocuments, documentsToEncrypt, fieldsToEncrypt, alreadyEncrypted, sampleData };
    }
}

// Main dry run function
async function runDryRun() {
    console.log('🔍 Starting data encryption analysis (DRY RUN)...');
    console.log('⚠️  This will analyze your data but NOT modify anything\n');

    const startTime = Date.now();
    let totalDocuments = 0;
    let totalToEncrypt = 0;
    let totalFieldsToEncrypt = 0;
    let totalAlreadyEncrypted = 0;

    try {
        // Connect to database
        await connectDB();

        // Analyze each model
        for (const [modelName, config] of Object.entries(migrationConfig)) {
            const result = await analyzeModel(modelName, config);
            totalDocuments += result.totalDocuments;
            totalToEncrypt += result.documentsToEncrypt;
            totalFieldsToEncrypt += result.fieldsToEncrypt;
            totalAlreadyEncrypted += result.alreadyEncrypted;
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n📊 DRY RUN SUMMARY:');
        console.log('='.repeat(50));
        console.log(`   - Total documents in database: ${totalDocuments}`);
        console.log(`   - Documents that would be modified: ${totalToEncrypt}`);
        console.log(`   - Fields that would be encrypted: ${totalFieldsToEncrypt}`);
        console.log(`   - Fields already encrypted: ${totalAlreadyEncrypted}`);
        console.log(`   - Analysis duration: ${duration} seconds`);

        if (totalToEncrypt === 0) {
            console.log('\n✅ All data is already encrypted! No migration needed.');
        } else {
            console.log('\n⚠️  MIGRATION WOULD BE NEEDED:');
            console.log(`   - ${totalToEncrypt} documents would be updated`);
            console.log(`   - ${totalFieldsToEncrypt} fields would be encrypted`);
            console.log('\n💡 To run the actual migration, use:');
            console.log('   npm run migrate:encrypt');
        }

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    } finally {
        await disconnectDB();
    }
}

// Run the dry run if this script is executed directly
if (require.main === module) {
    runDryRun().catch(console.error);
}

module.exports = {
    runDryRun,
    analyzeModel,
    testEncryptValue,
    isEncryptedData,
    isEncryptedString
}; 