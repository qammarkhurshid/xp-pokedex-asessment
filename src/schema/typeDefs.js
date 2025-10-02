export const typeDefs = `
  type Pokemon {
    id: Int!
    name: String!
    height: Int!
    weight: Int!
    baseExperience: Int
    sprites: Sprites!
    types: [TypeInfo!]!
    abilities: [AbilityInfo!]!
    stats: [StatInfo!]!
    species: Species!
  }

  type Sprites {
    frontDefault: String
    frontShiny: String
    backDefault: String
    backShiny: String
    officialArtwork: String
  }

  type TypeInfo {
    slot: Int!
    type: Type!
  }

  type Type {
    name: String!
    url: String!
  }

  type AbilityInfo {
    ability: Ability!
    isHidden: Boolean!
    slot: Int!
  }

  type Ability {
    name: String!
    url: String!
  }

  type StatInfo {
    baseStat: Int!
    effort: Int!
    stat: Stat!
  }

  type Stat {
    name: String!
    url: String!
  }

  type Species {
    name: String!
    url: String!
  }

  type PokemonList {
    count: Int!
    next: String
    previous: String
    results: [PokemonListItem!]!
  }

  type PokemonListItem {
    id: Int!
    name: String!
    url: String!
  }

  type FavoritePokemon {
    id: Int!
    name: String!
    addedAt: String!
    pokemon: Pokemon!
  }

  type AddFavoriteResponse {
    success: Boolean!
    message: String!
    favorite: FavoritePokemon
  }

  type RemoveFavoriteResponse {
    success: Boolean!
    message: String!
  }

  type Query {
    listPokemon(limit: Int = 20, offset: Int = 0): PokemonList!
    getPokemon(identifier: String!): Pokemon
    searchPokemon(query: String!): [PokemonListItem!]!
    getFavorites: [FavoritePokemon!]!
    isFavorite(pokemonId: Int!): Boolean!
  }

  type Mutation {
    addFavorite(pokemonId: Int!, pokemonName: String!): AddFavoriteResponse!
    removeFavorite(pokemonId: Int!): RemoveFavoriteResponse!
    clearFavorites: RemoveFavoriteResponse!
  }
`;
