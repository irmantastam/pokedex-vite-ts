<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Pokemon, PokemonResponseJson, PokemonResponseJsonResult, PokemonUrlResponseJson } from '../types/pokemon';
import PokemonCard from './PokemonCard.vue';

const pokemons = ref<Pokemon[]>();
const favouritePokemons = ref<string[]>([]);
const pokemonOffset = ref<number>(0);
const pokemonLimit: number = 8;

const pokemonApiEndpoint: string = 'https://pokeapi.co/api/v2/pokemon';

const fetchPokemons = async (limit: number, offset: number) => {
	try {
		const pokemonResponse = await fetch(
			pokemonApiEndpoint +
			`?limit=${limit}` +
			`&offset=${offset}`
		);
		const pokemonResponseJson: PokemonResponseJson = await pokemonResponse.json();

		const pokemonList: Promise<Pokemon>[] = pokemonResponseJson?.results?.map(async (pokemon: PokemonResponseJsonResult) => {
			const pokemonUrlResponse: Response = await fetch(pokemon.url)
			const pokemonUrlResponseJson: PokemonUrlResponseJson = await pokemonUrlResponse.json();
			const pokemonPhoto: string = pokemonUrlResponseJson?.sprites?.front_default;

			return {
				name: pokemon.name,
				photo: pokemonPhoto,
				isFavourite: !!favouritePokemons.value.find((name) => name === pokemon.name),
			}
		});

		return await Promise.all(pokemonList);
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
}

const setFavouritePokemon = (name: string) => {
	pokemons.value = pokemons.value.map((item) => {
		if (item.name !== name) {
			return item;
		}

		return {
			...item,
			isFavourite: !item.isFavourite,
		};
	})
	favouritePokemons.value = pokemons.value.reduce((result, value) => ([
		...result,
		...(value.isFavourite ? [value.name] : []),
	]), []);
	saveFavouritePokemonsToLocalStorage();
}

const setPokemonOffset = (offset: number) => {
	pokemonOffset.value = offset >= 0 ? offset : 0;
}

onMounted(() => {
	const savedFavouritePokemons = JSON.parse(localStorage.getItem('favouritePokemons'));

	if (savedFavouritePokemons) {
		favouritePokemons.value = savedFavouritePokemons;
	}
});

watch(pokemonOffset, async () => {
	pokemons.value = await fetchPokemons(pokemonLimit, pokemonOffset.value);
}, { immediate: true })

const saveFavouritePokemonsToLocalStorage = () => {
	localStorage.setItem('favouritePokemons', JSON.stringify(favouritePokemons.value));
};

</script>

<template>
	<ul class="list">
		<template v-for="pokemon in pokemons">
			<PokemonCard :photo="pokemon.photo" :name="pokemon.name" :isFavourite="pokemon.isFavourite"
				@setFavouritePokemon="setFavouritePokemon" />
		</template>
	</ul>
	<div class="pagination" v-if="pokemons">
		<button v-if="pokemonOffset > 0" class="prev" @click.prevent="setPokemonOffset(pokemonOffset - 10)">
			Previous
		</button>
		<button class="next" @click.prevent="setPokemonOffset(pokemonOffset + 10)">
			Next
		</button>
	</div>
</template>

<style scoped>
.list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	grid-gap: 20px;
	justify-items: stretch;
	max-width: 800px;
	margin: 0 auto;
}

.pagination {
	display: flex;
	margin: 40px auto;
	justify-content: center;
	gap: 10px;
}
</style>
