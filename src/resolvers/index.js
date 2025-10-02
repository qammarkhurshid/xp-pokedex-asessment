
export const resolvers = {
  Query: {
    listPokemon: async (_, { limit, offset }, { dataSources }) => {
      try {
        return await dataSources.pokeAPI.listPokemon(limit, offset);
      } catch (error) {
        throw new Error(`Failed to list Pokémon: ${error.message}`);
      }
    },
    getPokemon: async (_, { identifier }, { dataSources }) => {
      try {
        const pokemon = await dataSources.pokeAPI.getPokemon(identifier);
        if (!pokemon) {
          throw new Error(`Pokémon "${identifier}" not found`);
        }
        return pokemon;
      } catch (error) {
        throw new Error(`Failed to get Pokémon: ${error.message}`);
      }
    },
    searchPokemon: async (_, { query }, { dataSources }) => {
      try {
        if (!query || query.trim().length === 0) {
          throw new Error('Search query cannot be empty');
        }
        return await dataSources.pokeAPI.searchPokemon(query);
      } catch (error) {
        throw new Error(`Failed to search Pokémon: ${error.message}`);
      }
    },
    getFavorites: async (_, __, { dataSources, userId }) => {
      try {
        return dataSources.favorites.getFavorites(userId);
      } catch (error) {
        throw new Error(`Failed to get favorites: ${error.message}`);
      }
    },
    isFavorite: async (_, { pokemonId }, { dataSources, userId }) => {
      try {
        return dataSources.favorites.isFavorite(userId, pokemonId);
      } catch (error) {
        throw new Error(`Failed to check favorite status: ${error.message}`);
      }
    },
  },

  Mutation: {
    addFavorite: async (_, { pokemonId, pokemonName }, { dataSources, userId }) => {
      try {
        const pokemon = await dataSources.pokeAPI.getPokemon(pokemonId);
        if (!pokemon) {
          return {
            success: false,
            message: `Pokémon with ID ${pokemonId} not found`,
            favorite: null,
          };
        }

        const favorite = dataSources.favorites.addFavorite(userId, pokemonId, pokemonName);
        
        return {
          success: true,
          message: `${pokemonName} added to favorites!`,
          favorite,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          favorite: null,
        };
      }
    },
    removeFavorite: async (_, { pokemonId }, { dataSources, userId }) => {
      try {
        const removed = dataSources.favorites.removeFavorite(userId, pokemonId);
        
        if (!removed) {
          return {
            success: false,
            message: `Pokémon with ID ${pokemonId} not found in favorites`,
          };
        }

        return {
          success: true,
          message: 'Pokémon removed from favorites',
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
    clearFavorites: async (_, __, { dataSources, userId }) => {
      try {
        dataSources.favorites.clearFavorites(userId);
        
        return {
          success: true,
          message: 'All favorites cleared',
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
  FavoritePokemon: {
    pokemon: async (parent, _, { dataSources }) => {
      try {
        return await dataSources.pokeAPI.getPokemon(parent.id);
      } catch (error) {
        throw new Error(`Failed to fetch Pokémon data: ${error.message}`);
      }
    },
  },
};
