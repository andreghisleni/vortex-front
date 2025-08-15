import { createFileRoute, Link } from '@tanstack/react-router';
import { getPokemonList } from '@/api/pokemon';

export const Route = createFileRoute('/pokemon/')({
  component: PokemonList,
  loader: getPokemonList,
});

function PokemonList() {
  const pokemons = Route.useLoaderData();
  return (
    <>
      <h2>Pokemons</h2>
      <ul>
        {pokemons.map((pokemon) => (
          <li key={pokemon.id}>
            <Link
              params={{
                id: pokemon.id,
              }}
              to={'/pokemon/$id'}
            >
              {pokemon.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
