"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./config/setup"); // Initialize external clients (Redis, YouTube)
dotenv_1.default.config();
// Build primary Fastify server instantiation with native logger enabled
const app = (0, fastify_1.default)({
    logger: true,
});
const valuation_route_1 = __importDefault(require("./routes/valuation.route"));
const download_route_1 = __importDefault(require("./routes/download.route"));
const payment_route_1 = __importDefault(require("./routes/payment.route"));
// Register a simple health-check GET endpoint
app.get('/', async (request, reply) => {
    return { status: 'ok', message: 'Fastify server is healthy' };
});
app.register(valuation_route_1.default);
app.register(download_route_1.default);
app.register(payment_route_1.default);
const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '5000', 10);
        // Listen gracefully on 0.0.0.0 for local network testing
        await app.listen({ port, host: '0.0.0.0' });
        app.log.info(`Server is listening on http://0.0.0.0:${port}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
