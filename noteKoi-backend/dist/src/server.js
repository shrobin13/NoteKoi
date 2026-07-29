import { env } from "./config/index.js";
import { logger } from "./lib/logger.js";
import prisma from "./lib/prisma.js";
import { createApp } from "./app.js";
async function bootstrap() {
    try {
        // Verify database connection on startup
        await prisma.$connect();
        logger.info(" Connected to PostgreSQL via Prisma ORM");
        const app = createApp();
        const server = app.listen(env.PORT, () => {
            logger.info(` Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
        });
        // Graceful shutdown handling
        const shutdown = async (signal) => {
            logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                logger.info("HTTP server closed.");
                await prisma.$disconnect();
                logger.info("Prisma client disconnected.");
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }
    catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
}
bootstrap();
