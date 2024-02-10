<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Pokemon, PokemonResponseJson, PokemonResponseJsonResult, PokemonUrlResponseJson } from '../types/pokemon';
import PokemonCard from './PokemonCard.vue';

const searchParams = new URLSearchParams(window.location.search);
const page = searchParams.get('page');

const pokemons = ref<Pokemon[]>();
const favouritePokemons = ref<string[]>([]);
const pokemonsCount = ref<number>(0);
const totalPages = ref<number>(0);
const pokemonsPerPage: number = 8;
const currentPage = ref<number>((page && Number(page)) ?? 1);
const pokemonsOffset = ref<number>((currentPage.value - 1) * pokemonsPerPage);

const pokemonApiEndpoint: string = 'https://pokeapi.co/api/v2/pokemon';

const fetchPokemons = async (limit: number, offset: number) => {
	try {
		const pokemonResponse = await fetch(
			pokemonApiEndpoint +
			`?limit=${limit}` +
			`&offset=${offset}`
		);
		const pokemonResponseJson: PokemonResponseJson = await pokemonResponse.json();
		pokemonsCount.value = pokemonResponseJson.count;
		totalPages.value = Math.ceil(pokemonsCount.value / pokemonsPerPage)

		const pokemonList: Promise<Pokemon>[] = pokemonResponseJson?.results?.map(async (pokemon: PokemonResponseJsonResult) => {
			const pokemonUrlResponse: Response = await fetch(pokemon.url)
			const pokemonUrlResponseJson: PokemonUrlResponseJson = await pokemonUrlResponse.json();
			const pokemonPhoto: string = pokemonUrlResponseJson?.sprites?.front_default;

			return {
				name: pokemon.name,
				photo: pokemonPhoto,
				isFavourite: favouritePokemons.value.includes(pokemon.name),
			}
		});

		return await Promise.all(pokemonList);
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
}

const setFavouritePokemon = (name: string) => {
	pokemons.value = pokemons.value.map((pokemon) => {
		if (pokemon.name !== name) {
			return pokemon;
		}

		return {
			...pokemon,
			isFavourite: !pokemon.isFavourite,
		};
	})

	favouritePokemons.value = favouritePokemons.value.includes(name) ?
		favouritePokemons.value.filter((favourite) => favourite !== name) :
		[...favouritePokemons.value, name];

	saveFavouritePokemonsToLocalStorage();
}

const setCurrentPage = (page: number) => {
	pokemonsOffset.value = (page - 1) * pokemonsPerPage;
	currentPage.value = page;

	updatePageUrlParam(page.toString());
}

const updatePageUrlParam = (page: string) => {
	searchParams.set('page', page);
	const updatedParamsPathname = window.location.pathname + '?' + searchParams.toString();
	history.pushState(null, '', updatedParamsPathname);
}

onMounted(() => {
	const savedFavouritePokemons = JSON.parse(localStorage.getItem('favouritePokemons'));

	if (savedFavouritePokemons) {
		favouritePokemons.value = savedFavouritePokemons;
	}
});

watch(currentPage, async () => {
	if (currentPage.value <= 0) {
		setCurrentPage(1)
		return;
	}

	pokemons.value = await fetchPokemons(pokemonsPerPage, pokemonsOffset.value);

	if (currentPage.value > totalPages.value) {
		setCurrentPage(totalPages.value)
	}
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
		<p>
			Page
			<strong>{{ currentPage }}</strong>
			out of
			<strong>{{ totalPages }}</strong>
		</p>
		<div class="pagination-buttons" v-if="pokemons">
			<button v-if="currentPage > 1" class="prev" @click.prevent="setCurrentPage(currentPage - 1)">
				Previous
			</button>
			<button v-if="currentPage < totalPages" class="next" @click.prevent="setCurrentPage(currentPage + 1)">
				Next
			</button>
		</div>
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
	padding: 0;
}

.pagination {
	max-width: 800px;
	margin: 40px auto;
	text-align: center;
	color: #fff;
}

.pagination-buttons {
	display: flex;
	justify-content: center;
	gap: 10px;
}
</style>
