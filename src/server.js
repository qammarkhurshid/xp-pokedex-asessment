import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { PokeAPIDataSource } from './datasources/PokeAPIDataSource.js';
import { FavoritesDataSource } from './datasources/FavoritesDataSource.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

export async function createServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const pokeAPIDataSource = new PokeAPIDataSource();
  const favoritesDataSource = new FavoritesDataSource();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async requestDidStart() {
          return {
            async didEncounterErrors(requestContext) {
              logger.error('GraphQL Error:', requestContext.errors);
            },
          };
        },
      },
    ],
    introspection: config.graphql.introspection,
    formatError: (formattedError) => {
      logger.error('GraphQL Error:', {
        message: formattedError.message,
        path: formattedError.path,
        extensions: formattedError.extensions,
      });

      return {
        message: formattedError.message,
        locations: formattedError.locations,
        path: formattedError.path,
        extensions: {
          code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
        },
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(config.cors),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const userId = req.headers['x-user-id'] || 'default';
        
        return {
          dataSources: {
            pokeAPI: pokeAPIDataSource,
            favorites: favoritesDataSource,
          },
          userId,
        };
      },
    })
  );

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.get('/', (req, res) => {
    res.json({
      message: 'Pokédex GraphQL API',
      graphql: '/graphql',
      health: '/health',
      version: '1.0.0',
    });
  });

  return { app, httpServer, server };
}
