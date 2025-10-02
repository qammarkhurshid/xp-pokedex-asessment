# xp-pokedex-assessment

A small GraphQL Pokédex API that wraps the public PokeAPI and implements an in-memory per-user favorites store.

This repository exposes a GraphQL endpoint with queries for listing and retrieving Pokémon and mutations for managing favorites.

## Quick overview

- Server entry: `src/index.js`
- Server creation: `src/server.js`
- GraphQL schema: `src/schema/typeDefs.js`
- Resolvers: `src/resolvers/index.js`
- External API wrapper: `src/datasources/PokeAPIDataSource.js`
- In-memory favorites store: `src/datasources/FavoritesDataSource.js`
- Config: `src/config/index.js`
- Logger helper: `src/utils/logger.js`

## Prerequisites

- Node.js (12+ recommended, use the version declared in your environment)
- npm

## Install

Open a terminal in the project root and run:

```bash
npm install
```

## Environment

Copy the example env file (if present) and adjust values if needed:

```bash
cp .env.example .env
```

Important environment variables (defaults are used if missing):

- `PORT` — server port (default: `4000`)
- `NODE_ENV` — `development` or `production` (affects playground/introspection)
- `POKEAPI_BASE_URL` — (optional) base URL for PokeAPI (default: `https://pokeapi.co/api/v2`)

## Run

Start in development (auto-reload if `nodemon` is configured):

```bash
npm run dev
```

Start production:

```bash
npm start
```

By default the server listens on the port from `src/config/index.js` (usually `4000`).

GraphQL endpoint:

- HTTP: http://localhost:4000/graphql
- Health: http://localhost:4000/health

## Authentication / per-user favorites

The app is intentionally simple: favorites are stored in-memory and are separated by user using the `x-user-id` HTTP header. Set a different `x-user-id` in requests to get independent favorite lists. If the header is missing, a default id (for example `default`) is used.

Note: in-memory favorites are ephemeral and will be lost on server restart.

## Schema summary — available queries & mutations

Full type definitions live in `src/schema/typeDefs.js`. Below are the main operations exposed by the API.

Queries
- `listPokemon(limit: Int = 20, offset: Int = 0): PokemonList!` — paginated list
- `getPokemon(identifier: String!): Pokemon` — retrieve by id or name
- `searchPokemon(query: String!): [PokemonListItem!]!` — search by substring
- `getFavorites: [FavoritePokemon!]!` — list favorites for request user
- `isFavorite(pokemonId: Int!): Boolean!` — whether given pokemonId is in favorites

Mutations
- `addFavorite(pokemonId: Int!, pokemonName: String!): AddFavoriteResponse!` — add to favorites
- `removeFavorite(pokemonId: Int!): RemoveFavoriteResponse!` — remove from favorites
- `clearFavorites: RemoveFavoriteResponse!` — remove all favorites for the user

Types (common fields)
- `Pokemon` — id, name, height, weight, baseExperience, sprites, types, etc.
- `PokemonListItem` — id, name, url
- `FavoritePokemon` — id, name, addedAt, pokemon

## Example queries

List Pokémon (first 10):

```graphql
query ListPokemon {
  listPokemon(limit: 10, offset: 0) {
    count
    results {
      id
      name
      url
    }
  }
}
```

Get a Pokémon by id or name:

```graphql
query GetPokemon {
  getPokemon(identifier: "1") {
    id
    name
    height
    weight
    baseExperience
    sprites {
      frontDefault
      officialArtwork
    }
    types {
      slot
      type {
        name
      }
    }
  }
}
```

Search by substring:

```graphql
query SearchPokemon {
  searchPokemon(query: "saur") {
    id
    name
  }
}
```

Favorites examples (remember to set `x-user-id` to separate users):

Add favorite:

```graphql
mutation AddFavorite {
  addFavorite(pokemonId: 1, pokemonName: "bulbasaur") {
    success
    message
    favorite {
      id
      name
      addedAt
      pokemon {
        id
        name
      }
    }
  }
}
```

Remove favorite:

```graphql
mutation RemoveFavorite {
  removeFavorite(pokemonId: 1) {
    success
    message
  }
}
```

Get favorites:

```graphql
query MyFavorites {
  getFavorites {
    id
    name
    addedAt
    pokemon {
      id
      name
    }
  }
}
```

Check favorite status:

```graphql
query IsFav {
  isFavorite(pokemonId: 1)
}
```

Curl example (mutation) including `x-user-id` header:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "x-user-id: alice" \
  -d '{"query":"mutation { addFavorite(pokemonId:1,pokemonName:\"bulbasaur\"){ success message favorite{ id name } } }"}'
```

## Project file map

- `package.json` — scripts & dependencies
- `src/index.js` — server bootstrap
- `src/server.js` — server & Apollo setup, request context (adds user id from `x-user-id`)
- `src/schema/typeDefs.js` — GraphQL schema
- `src/resolvers/index.js` — GraphQL resolvers
- `src/datasources/PokeAPIDataSource.js` — wraps PokeAPI calls
- `src/datasources/FavoritesDataSource.js` — in-memory favorites logic
- `src/config/index.js` — configuration handling
- `src/utils/logger.js` — logging helper

## Notes, limitations & next steps

- Favorites are stored in-memory. To persist favorites across restarts, replace `FavoritesDataSource` with a database-backed implementation.
- There is no authentication — the `x-user-id` header is trusted and used only to separate favorites per user. Add real auth if needed.
- PokeAPI rate limits may apply when calling the upstream API.

If you want, I can:

- Add a small persistent favorites implementation (SQLite or lowdb) and wire it into `FavoritesDataSource`.
- Add example GraphQL tests or a Postman collection.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Open a pull request

## License

Add your preferred license file if you plan to publish this project. This repository does not include one by default.
