/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useMounted } from "@/hooks/use-mounted"
import { useProfileStore } from "@/stores/profile"
import { useSearchStore } from "@/stores/search"
import type { SessionUser } from "@/types"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api/api"
import ShowsGrid from "@/components/shows-grid"
import ShowSkeleton from "@/components/shows-skeleton"

interface PokemonResponse {
  count: number
  next: string
  previous: string
  results: { name: string; url: string }[]
}
interface MyShowsProps {
  user?: SessionUser
}

const PokemonTile = ({ name, url }: { name: string; url: string }) => {
  const pokemonQuery = useQuery(
    ["pokemon", name],
    async () => {
      const res = await fetch(url)
      const data = await res.json()
      return data
    },
    {
      enabled: !!name,
    }
  )

  const { data, status } = pokemonQuery

  if (status === "loading") {
    return <ShowSkeleton />
  }

  if (status === "error") {
    return <div>Error</div>
  }

  if (!data) {
    return null
  }
  return (
    <div className="relative h-24 w-24 rounded-full border-8 border-b-yellow-500">
      {/* <Image src={data.sprites.front_default} alt={data.name} fill /> */}
      <img
        className="h-24 w-24 rounded-full border-8 border-b-yellow-500"
        src={data.sprites.front_default}
        alt={data.name}
      />
      {/* <div className="mt-2 text-sm font-medium text-gray-900">{data.name}</div> */}
    </div>
  )
}

const HotCollection = ({ user }: MyShowsProps) => {
  const fetchPokemon = async ({ pageParam = 0 }) => {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${pageParam}&limit=10`
    )
    const data: PokemonResponse = await res.json()
    return data
  }

  // TODO: fetch pokemon sprites
  // const fetchPokemonSprite = async (id: number) => {
  //   const res = await fetch(
  //     `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  //   )
  //   const data = await res.json()
  //   return data
  // }
  // const pokemonSpriteQuery = useQuery()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: fetchPokemon,
    getNextPageParam: (lastPage, pages) => {
      console.log(pages)

      const { next } = lastPage
      if (!next) {
        return undefined
      }

      const url = new URL(next)
      const offset = url.searchParams.get("offset")
      return offset
    },
  })

  const myQuery = useQuery(
    ["pokemon_list"],
    async () => {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10")
      const data: PokemonResponse = await res.json()

      return data?.results
    },
    { cacheTime: Infinity }
  )

  const { scrollTop, clientHeight, scrollHeight } = document.documentElement
  const handleScroll = () => {
    if (scrollTop + clientHeight >= scrollHeight) {
      void fetchNextPage()
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  })

  // const myShowsQuery = profileStore.profile
  //   ? api.myList.getAll.useQuery(profileStore.profile.id, {
  //       enabled: !!user,
  //     })
  //   : null

  console.log("myQuery", myQuery)

  if (myQuery.isLoading) {
    return <div>Loading...</div>
  }

  // if (myShowsQuery?.data?.length === 0) {
  //   return (
  //     <div className="container w-full max-w-screen-2xl flex-col gap-2.5">
  //       <h1 className="text-2xl font-bold sm:text-3xl">Your list is empty</h1>
  //       <p className="text-slate-400 dark:text-slate-400">
  //         Add shows and movies to your list to watch them later
  //       </p>
  //     </div>
  //   )
  // }

  return (
    <>
      <div className="grid-cols-6 gap-4">
        {myQuery?.data?.map((pokemon) => (
          // <div className="flex flex-1 flex-col pl-12" key={pokemon.name}>
          //   {pokemon.name}
          //   {/* <img alt={pokemon.name} src={pokemon.url} /> */}
          // </div>
          <PokemonTile
            key={pokemon.name}
            name={pokemon.name}
            url={pokemon.url}
          />
        ))}
      </div>
      <br />
      <br />
      <div className="grid">
        {data?.pages?.map((page) => {
          return page.results.map((pokemon) => (
            <div className="grid pl-10" key={pokemon.name}>
              {pokemon.name}
            </div>
          ))
        })}
      </div>
      {hasNextPage ? (
        <button
          className="m-14 border p-4 align-middle uppercase text-cyan-300"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={() => fetchNextPage()}
        >
          next page
        </button>
      ) : null}
      <p>
        {JSON.stringify(
          {
            fetchNextPage,
            hasNextPage,
            isFetching,
            isFetchingNextPage,
            status,
          },
          null,
          4
        )}
      </p>
      <p>
        {JSON.stringify({ scrollTop, clientHeight, scrollHeight }, null, 2)}
      </p>
    </>
    // <ShowsGrid
    //   shows={user && myShowsQuery?.isSuccess ? myShowsQuery.data : []}
    // />
  )
}

export default HotCollection
