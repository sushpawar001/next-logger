import mongoose, { Schema, Document } from "mongoose";
import {
    encrypt,
    decrypt,
    isEncryptedData,
    encryptFieldToString,
    decryptFieldFromString,
    EncryptedData,
} from "./encryption";

export interface EncryptionConfig {
    /** Fields to encrypt/decrypt */
    fields: string[];
    /** Whether to encrypt fields on save (default: true) */
    encryptOnSave?: boolean;
    /** Whether to decrypt fields on read (default: true) */
    decryptOnRead?: boolean;
    /** Whether to store encrypted data as JSON strings in database (default: false) */
    storeAsString?: boolean;
    /** Whether to handle array fields (default: false) */
    handleArrays?: boolean;
    /** Whether to handle nested object fields (default: false) */
    handleNested?: boolean;
}

export interface MongooseEncryptionOptions {
    /** Configuration for encryption behavior */
    config: EncryptionConfig;
    /** Custom error handler function */
    onError?: (error: Error, operation: string, field?: string) => void;
    /** Whether to log encryption/decryption operations (default: false) */
    debug?: boolean;
}

/**
 * Adds encryption and decryption hooks to a Mongoose schema
 * @param schema - The Mongoose schema to add hooks to
 * @param options - Configuration options for encryption behavior
 */
export function addEncryptionHooks<T extends Document>(
    schema: Schema<T>,
    options: MongooseEncryptionOptions
): void {
    const { config, onError, debug = false } = options;
    const {
        fields,
        encryptOnSave = true,
        decryptOnRead = true,
        storeAsString = false,
        handleArrays = false,
        handleNested = false,
    } = config;

    if (!fields || fields.length === 0) {
        throw new Error("At least one field must be specified for encryption");
    }

    // Validate that all specified fields exist in the schema
    const schemaFields = Object.keys(schema.paths);
    const invalidFields = fields.filter(
        (field) => !schemaFields.includes(field)
    );
    if (invalidFields.length > 0) {
        throw new Error(
            `Invalid fields specified for encryption: ${invalidFields.join(
                ", "
            )}`
        );
    }

    // // validate that all fields are of type string
    // const invalidTypes = fields.filter(
    //     (field) => typeof schema.paths[field].options.type !== "string"
    // );
    // if (invalidTypes.length > 0) {
    //     console.log("$$$$$$", schema.paths[invalidTypes[0]].options.type);
    //     throw new Error(`Invalid field types specified for encryption: ${invalidTypes.join(", ")}`);
    // }

    const log = (message: string) => {
        if (debug) {
            console.log(`[Encryption] ${message}`);
        }
    };

    const handleError = (error: Error, operation: string, field?: string) => {
        log(
            `Error during ${operation}${field ? ` for field ${field}` : ""}: ${
                error.message
            }`
        );
        if (onError) {
            onError(error, operation, field);
        }
    };

    // Helper function to encrypt a single field value
    const encryptFieldValue = (value: any, fieldName: string): any => {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle arrays
        if (handleArrays && Array.isArray(value)) {
            return value.map((item) => encryptFieldValue(item, fieldName));
        }

        // Handle nested objects
        if (
            handleNested &&
            typeof value === "object" &&
            !isEncryptedData(value)
        ) {
            const encryptedObj: any = {};
            for (const [key, val] of Object.entries(value)) {
                encryptedObj[key] = encryptFieldValue(
                    val,
                    `${fieldName}.${key}`
                );
            }
            return encryptedObj;
        }

        // Skip if already encrypted
        if (isEncryptedData(value)) {
            return value;
        }

        try {
            // Convert value to string based on its type
            let stringValue: string;
            if (typeof value === "object" && value !== null) {
                // For objects and arrays, convert to JSON string
                stringValue = JSON.stringify(value);
            } else if (
                typeof value === "number" ||
                typeof value === "boolean" ||
                value instanceof Date
            ) {
                // For primitive types and Date objects, convert to string representation
                stringValue = value.toString();
            } else {
                // For strings and other types, use String() conversion
                stringValue = String(value);
            }

            const encryptionResult = encrypt(stringValue);

            if (!encryptionResult.success) {
                throw new Error(encryptionResult.error);
            }

            log(
                `Encrypted field ${fieldName} (original type: ${typeof value})`
            );
            return storeAsString
                ? JSON.stringify(encryptionResult.data)
                : encryptionResult.data;
        } catch (error) {
            handleError(error as Error, "encryption", fieldName);
            throw error;
        }
    };

    // Helper function to decrypt a single field value
    const decryptFieldValue = (value: any, fieldName: string): any => {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle arrays
        if (handleArrays && Array.isArray(value)) {
            return value.map((item) => decryptFieldValue(item, fieldName));
        }

        // Handle nested objects
        if (
            handleNested &&
            typeof value === "object" &&
            !isEncryptedData(value)
        ) {
            const decryptedObj: any = {};
            for (const [key, val] of Object.entries(value)) {
                decryptedObj[key] = decryptFieldValue(
                    val,
                    `${fieldName}.${key}`
                );
            }
            return decryptedObj;
        }

        // Handle string-stored encrypted data
        if (storeAsString && typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (isEncryptedData(parsed)) {
                    const decryptionResult = decrypt(parsed);
                    if (decryptionResult.success) {
                        log(`Decrypted field ${fieldName} (from string)`);
                        return decryptionResult.data;
                    } else {
                        throw new Error(decryptionResult.error);
                    }
                }
            } catch (error) {
                // If parsing fails, it might not be encrypted data
                return value;
            }
        }

        // Handle object-stored encrypted data
        if (isEncryptedData(value)) {
            try {
                const decryptionResult = decrypt(value);
                if (decryptionResult.success) {
                    // Try to parse the decrypted string back to its original type
                    try {
                        // First try to parse as JSON (for objects and arrays)
                        const parsedValue = JSON.parse(decryptionResult.data);
                        log(`Decrypted field ${fieldName} as JSON`);
                        return parsedValue;
                    } catch (e) {
                        // If not JSON, return as string
                        log(`Decrypted field ${fieldName} as string`);
                        return decryptionResult.data;
                    }
                } else {
                    throw new Error(decryptionResult.error);
                }
            } catch (error) {
                handleError(error as Error, "decryption", fieldName);
                return value; // Return original value on decryption failure
            }
        }

        return value;
    };

    // Pre-save middleware to encrypt fields
    if (encryptOnSave) {
        schema.pre("save", function (next) {
            try {
                const doc = this as any;
                let hasChanges = false;

                for (const field of fields) {
                    if (doc.isModified(field) && doc[field] !== undefined) {
                        const originalValue = doc[field];
                        const encryptedValue = encryptFieldValue(
                            originalValue,
                            field
                        );

                        if (encryptedValue !== originalValue) {
                            doc[field] = encryptedValue;
                            hasChanges = true;
                        }
                    }
                }

                if (hasChanges) {
                    log(`Encrypted ${fields.length} fields before save`);
                }

                next();
            } catch (error) {
                next(error as Error);
            }
        });

        // Also handle update operations
        schema.pre(
            /^update|^findOneAndUpdate|^findByIdAndUpdate/,
            function (this: any, next) {
                try {
                    const update = this.getUpdate();
                    if (!update) {
                        return next();
                    }

                    let hasChanges = false;

                    // Handle $set operations
                    if (update.$set) {
                        for (const field of fields) {
                            if (update.$set[field] !== undefined) {
                                const originalValue = update.$set[field];
                                const encryptedValue = encryptFieldValue(
                                    originalValue,
                                    field
                                );

                                if (encryptedValue !== originalValue) {
                                    update.$set[field] = encryptedValue;
                                    hasChanges = true;
                                }
                            }
                        }
                    }

                    // Handle direct field updates
                    for (const field of fields) {
                        if (update[field] !== undefined && !update.$set) {
                            const originalValue = update[field];
                            const encryptedValue = encryptFieldValue(
                                originalValue,
                                field
                            );

                            if (encryptedValue !== originalValue) {
                                update[field] = encryptedValue;
                                hasChanges = true;
                            }
                        }
                    }

                    if (hasChanges) {
                        log(`Encrypted ${fields.length} fields before update`);
                    }

                    next();
                } catch (error) {
                    next(error as Error);
                }
            }
        );
    }

    // Post-read middleware to decrypt fields
    if (decryptOnRead) {
        const decryptDocument = (doc: any) => {
            if (!doc || typeof doc !== "object") {
                return;
            }

            let hasChanges = false;

            for (const field of fields) {
                if (doc[field] !== undefined) {
                    const originalValue = doc[field];
                    const decryptedValue = decryptFieldValue(
                        originalValue,
                        field
                    );

                    if (decryptedValue !== originalValue) {
                        doc[field] = decryptedValue;
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges) {
                log(`Decrypted ${fields.length} fields after read`);
            }
        };

        // Handle find operations
        // Handle find operations
        schema.post(/^find/, function (docs) {
            try {
                if (Array.isArray(docs)) {
                    docs.forEach((doc) => decryptDocument(doc));
                } else {
                    decryptDocument(docs);
                }
            } catch (error) {
                handleError(error as Error, "post-find decryption");
            }
        });

        // Handle aggregate operations
        schema.post(/^aggregate/, function (docs) {
            try {
                if (Array.isArray(docs)) {
                    docs.forEach((doc) => decryptDocument(doc));
                }
            } catch (error) {
                handleError(error as Error, "post-aggregate decryption");
            }
        });

        // Handle populate operations
        schema.post(/^populate/, function (doc) {
            try {
                decryptDocument(doc);
            } catch (error) {
                handleError(error as Error, "post-populate decryption");
            }
        });
    }

    // Add virtual getter/setter for encrypted fields (optional)
    fields.forEach((field) => {
        if (!schema.virtuals[field]) {
            schema
                .virtual(`${field}_decrypted`)
                .get(function (this: any) {
                    return decryptFieldValue(this[field], field);
                })
                .set(function (this: any, value: any) {
                    this[field] = encryptFieldValue(value, field);
                });
        }
    });

    log(`Encryption hooks added for fields: ${fields.join(", ")}`);
}

/**
 * Utility function to create a schema with encryption hooks
 * @param schemaDefinition - The schema definition object
 * @param encryptionOptions - Encryption configuration
 * @returns Mongoose schema with encryption hooks
 */
export function createEncryptedSchema<T extends Document>(
    schemaDefinition: mongoose.SchemaDefinition,
    encryptionOptions: MongooseEncryptionOptions
): Schema<T> {
    const schema = new Schema<T>(schemaDefinition);
    addEncryptionHooks(schema, encryptionOptions);
    return schema;
}

/**
 * Utility function to check if a document has encrypted fields
 * @param doc - The document to check
 * @param fields - The fields to check for encryption
 * @returns True if any of the specified fields are encrypted
 */
export function hasEncryptedFields(doc: any, fields: string[]): boolean {
    return fields.some((field) => {
        const value = doc[field];
        return value && isEncryptedData(value);
    });
}

/**
 * Utility function to manually encrypt specific fields in a document
 * @param doc - The document to encrypt
 * @param fields - The fields to encrypt
 * @param storeAsString - Whether to store as JSON string
 * @param handleArrays - Whether to handle array fields
 * @param handleNested - Whether to handle nested object fields
 * @returns The document with encrypted fields
 */
export function encryptDocumentFields(
    doc: any,
    fields: string[],
    storeAsString: boolean = false,
    handleArrays: boolean = false,
    handleNested: boolean = false
): any {
    const result = { ...doc };

    const encryptValue = (value: any, fieldName: string): any => {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle arrays
        if (handleArrays && Array.isArray(value)) {
            return value.map((item) => encryptValue(item, fieldName));
        }

        // Handle nested objects
        if (
            handleNested &&
            typeof value === "object" &&
            !isEncryptedData(value)
        ) {
            const encryptedObj: any = {};
            for (const [key, val] of Object.entries(value)) {
                encryptedObj[key] = encryptValue(val, `${fieldName}.${key}`);
            }
            return encryptedObj;
        }

        // Skip if already encrypted
        if (isEncryptedData(value)) {
            return value;
        }

        // Convert value to string based on its type
        let stringValue: string;
        if (typeof value === "object" && value !== null) {
            stringValue = JSON.stringify(value);
        } else if (
            typeof value === "number" ||
            typeof value === "boolean" ||
            value instanceof Date
        ) {
            stringValue = value.toString();
        } else {
            stringValue = String(value);
        }

        const encryptionResult = encrypt(stringValue);
        if (!encryptionResult.success) {
            throw new Error(encryptionResult.error);
        }

        return storeAsString
            ? JSON.stringify(encryptionResult.data)
            : encryptionResult.data;
    };

    for (const field of fields) {
        if (result[field] !== undefined) {
            result[field] = encryptValue(result[field], field);
        }
    }

    return result;
}

/**
 * Utility function to manually decrypt specific fields in a document
 * @param doc - The document to decrypt
 * @param fields - The fields to decrypt
 * @param storeAsString - Whether the data is stored as JSON string
 * @param handleArrays - Whether to handle array fields
 * @param handleNested - Whether to handle nested object fields
 * @returns The document with decrypted fields
 */
export function decryptDocumentFields(
    doc: any,
    fields: string[],
    storeAsString: boolean = false,
    handleArrays: boolean = false,
    handleNested: boolean = false
): any {
    const result = { ...doc };

    const decryptValue = (value: any, fieldName: string): any => {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle arrays
        if (handleArrays && Array.isArray(value)) {
            return value.map((item) => decryptValue(item, fieldName));
        }

        // Handle nested objects
        if (
            handleNested &&
            typeof value === "object" &&
            !isEncryptedData(value)
        ) {
            const decryptedObj: any = {};
            for (const [key, val] of Object.entries(value)) {
                decryptedObj[key] = decryptValue(val, `${fieldName}.${key}`);
            }
            return decryptedObj;
        }

        // Handle string-stored encrypted data
        if (storeAsString && typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (isEncryptedData(parsed)) {
                    const decryptionResult = decrypt(parsed);
                    if (decryptionResult.success) {
                        try {
                            return JSON.parse(decryptionResult.data);
                        } catch (e) {
                            return decryptionResult.data;
                        }
                    }
                }
            } catch (error) {
                return value;
            }
        }

        // Handle object-stored encrypted data
        if (isEncryptedData(value)) {
            try {
                const decryptionResult = decrypt(value);
                if (decryptionResult.success) {
                    try {
                        return JSON.parse(decryptionResult.data);
                    } catch (e) {
                        return decryptionResult.data;
                    }
                }
            } catch (error) {
                return value;
            }
        }

        return value;
    };

    for (const field of fields) {
        if (result[field] !== undefined) {
            result[field] = decryptValue(result[field], field);
        }
    }

    return result;
}
