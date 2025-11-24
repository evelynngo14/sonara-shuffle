'use client'
import { useState } from "react";
import { ListGenres } from "./components/ListGenres";
import { ListDecades, Decades } from "./components/ListDecades";
import SongFinder from "./components/SongFinder";

const Genres = ['any', 'pop', 'rock', 'hip-hop', 'jazz', 'country', 'electronic'];

export default function Home() {
  return (
    <>
      <SongFinder></SongFinder>
    </>)
}
