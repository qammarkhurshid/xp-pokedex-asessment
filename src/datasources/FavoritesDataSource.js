export class FavoritesDataSource {
  constructor() {
    this.favorites = new Map();
  }

  getFavorites(userId = 'default') {
    const userFavorites = this.favorites.get(userId) || [];
    return Array.from(userFavorites.values());
  }

  addFavorite(userId = 'default', pokemonId, pokemonName) {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Map());
    }

    const userFavorites = this.favorites.get(userId);

    if (userFavorites.has(pokemonId)) {
      throw new Error(`Pokémon ${pokemonName} is already in your favorites`);
    }

    const favorite = {
      id: pokemonId,
      name: pokemonName,
      addedAt: new Date().toISOString(),
    };

    userFavorites.set(pokemonId, favorite);
    return favorite;
  }

  removeFavorite(userId = 'default', pokemonId) {
    const userFavorites = this.favorites.get(userId);
    if (!userFavorites) {
      return false;
    }
    return userFavorites.delete(pokemonId);
  }

  isFavorite(userId = 'default', pokemonId) {
    const userFavorites = this.favorites.get(userId);
    return userFavorites ? userFavorites.has(pokemonId) : false;
  }

  clearFavorites(userId = 'default') {
    if (this.favorites.has(userId)) {
      this.favorites.get(userId).clear();
      return true;
    }
    return false;
  }
  
  getFavoritesCount(userId = 'default') {
    const userFavorites = this.favorites.get(userId);
    return userFavorites ? userFavorites.size : 0;
  }
}
