<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
	photo: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	isFavourite: {
		type: Boolean,
		required: true
	},
})

const emit = defineEmits(['setFavouritePokemon']);

const setFavouritePokemon = (name: string) => {
	emit('setFavouritePokemon', name);
};

</script>

<template>
	<li class="card">
		<img :src="photo" class="image" :alt="name" />
		<h2 class="name">{{ name }}</h2>
		<button class="favourite" :title="isFavourite ? 'Remove from favourites' : 'Add to favourites'"
			@click.prevent="setFavouritePokemon(name)">
			<svg viewBox="0 0 300 275" xmlns="http://www.w3.org/2000/svg" version="1.1" class="star">
				<polygon stroke="#fff" :fill="isFavourite ? '#fa2356' : ''" stroke-width="20"
					points="150,25 179,111 269,111 197,165  223,251 150,200 77,251 103,165 31,111 121,111" />
			</svg>
		</button>
	</li>
</template>

<style scoped>
.card {
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: #fff;
	border-radius: 7px;
	box-shadow: 0 4px 16px rgb(0 0 0 / 20%);
}

.image {
	max-width: 150px;
}

.favourite {
	all: unset;
	margin-bottom: 20px;
}

.favourite:focus-visible {
	outline: auto;
}

.name {
	margin-bottom: 10px;
	color: #000;
	text-align: center;
	text-transform: capitalize;
	font-weight: 500;
}

.star {
	width: 40px;
	height: 40px;
	padding: 10px;
	border-radius: 40px;
	cursor: pointer;
	background-color: #fa2356;
	box-shadow: 0 4px 16px rgb(0 0 0 / 20%);
	transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.star:hover {
	background-color: #d21d48;
}

.star:active {
	background-color: #fa2356;
}
</style>
