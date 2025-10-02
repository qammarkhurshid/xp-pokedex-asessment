import { createServer } from './server.js';
import { config, validateConfig } from './config/index.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    validateConfig();
    const { httpServer } = await createServer();
    await new Promise((resolve) => {
      httpServer.listen({ port: config.port }, resolve);
    });

    logger.info(`🚀 Server ready at http://localhost:${config.port}/graphql`);
    logger.info(`📊 Health check available at http://localhost:${config.port}/health`);
    logger.info(`🌍 Environment: ${config.nodeEnv}`);
    
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
