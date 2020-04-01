require('dotenv').config();

const { JWT_SECRET, MONGODB_URI, NODE_ENV, PORT } = process.env;

if (NODE_ENV === 'production') {
    if (!PORT) {
        throw new Error('PORT is not defined');
    }
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
}
