interface Pokemon {
  name: string;
  photo: string;
  isFavourite: boolean;
}

interface PokemonResponseJson {
  count: number;
  next: string;
  previous?: string;
  results: PokemonResponseJsonResult[];
}

interface PokemonResponseJsonResult {
  name: string;
  url: string;
}

// Should we implement type safety to all of the API data?
interface PokemonUrlResponseJson {
  sprites: {
    front_default: string;
  };
}

export type {
  Pokemon,
  PokemonResponseJson,
  PokemonResponseJsonResult,
  PokemonUrlResponseJson,
};
