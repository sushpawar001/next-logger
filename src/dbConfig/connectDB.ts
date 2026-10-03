import mongoose from 'mongoose';

/**
 * Sized for Atlas M0 + Vercel Hobby: every warm function instance holds its own
 * pool and the free cluster caps total connections, so keep each pool small and
 * let idle sockets close. A short server-selection timeout makes an Atlas outage
 * fail the request in seconds instead of hanging it for mongoose's default 30s.
 */
const CONNECT_OPTIONS = {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
};

// Shared by every route module in the instance (and survives dev HMR), so the
// module-scope connectDB() calls reuse one connection and one error listener.
const cache = globalThis as typeof globalThis & {
    __mongoConnect?: Promise<typeof mongoose> | null;
    __mongoListening?: boolean;
};

export async function connectDB() {
    if (!cache.__mongoListening) {
        cache.__mongoListening = true;
        // Logged, not fatal: exiting would kill every in-flight request on
        // this instance and force a cold start.
        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error. ' + err);
        });
    }

    if (!cache.__mongoConnect) {
        try {
            cache.__mongoConnect = mongoose
                .connect(process.env.MONGO_URI!, CONNECT_OPTIONS)
                .catch((error) => {
                    // Clear the cache so the next call retries.
                    cache.__mongoConnect = null;
                    throw error;
                });
        } catch (error) {
            cache.__mongoConnect = null;
            console.log('Something went wrong!');
            console.log(error);
            return;
        }
    }

    try {
        await cache.__mongoConnect;
    } catch (error) {
        // Module-scope callers don't await this, so never reject; queries
        // surface the failure themselves.
        console.log('MongoDB connection failed. ' + error);
    }
}
