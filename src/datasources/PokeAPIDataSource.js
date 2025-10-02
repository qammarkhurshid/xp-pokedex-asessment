import axios from 'axios';

export class PokeAPIDataSource {
  constructor() {
    this.baseURL = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async listPokemon(limit = 20, offset = 0) {
    try {
      const response = await this.client.get('/pokemon', {
        params: { limit, offset },
      });
      
      const transformedData = {
        ...response.data,
        results: response.data.results.map(pokemon => ({
          ...pokemon,
          id: this.extractIdFromUrl(pokemon.url)
        }))
      };
      
      return transformedData;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch Pokémon list');
    }
  }

  async getPokemon(identifier) {
    try {
      const response = await this.client.get(`/pokemon/${identifier}`);
      return this.transformPokemonData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw this.handleError(error, `Failed to fetch Pokémon: ${identifier}`);
    }
  }

  async searchPokemon(query) {
    try {
      const response = await this.client.get('/pokemon', {
        params: { limit: 1000, offset: 0 },
      });
      
      const searchTerm = query.toLowerCase().trim();
      const results = response.data.results
        .filter(pokemon => pokemon.name.includes(searchTerm))
        .map(pokemon => ({
          ...pokemon,
          id: this.extractIdFromUrl(pokemon.url)
        }));
      
      return results;
    } catch (error) {
      throw this.handleError(error, 'Failed to search Pokémon');
    }
  }

  extractIdFromUrl(url) {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1], 10) : 0;
  }

  transformPokemonData(data) {
    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      baseExperience: data.base_experience,
      sprites: {
        frontDefault: data.sprites.front_default,
        frontShiny: data.sprites.front_shiny,
        backDefault: data.sprites.back_default,
        backShiny: data.sprites.back_shiny,
        officialArtwork: data.sprites.other?.['official-artwork']?.front_default,
      },
      types: data.types.map(typeInfo => ({
        slot: typeInfo.slot,
        type: {
          name: typeInfo.type.name,
          url: typeInfo.type.url,
        },
      })),
      abilities: data.abilities.map(abilityInfo => ({
        ability: {
          name: abilityInfo.ability.name,
          url: abilityInfo.ability.url,
        },
        isHidden: abilityInfo.is_hidden,
        slot: abilityInfo.slot,
      })),
      stats: data.stats.map(statInfo => ({
        baseStat: statInfo.base_stat,
        effort: statInfo.effort,
        stat: {
          name: statInfo.stat.name,
          url: statInfo.stat.url,
        },
      })),
      species: {
        name: data.species.name,
        url: data.species.url,
      },
    };
  }

  handleError(error, message) {
    if (error.response) {
      return new Error(`${message}: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      return new Error(`${message}: No response from PokeAPI`);
    } else {
      return new Error(`${message}: ${error.message}`);
    }
  }
}
