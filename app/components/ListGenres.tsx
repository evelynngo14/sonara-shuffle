import React from "react";

export interface ListGenreProps {
  genres: string[];
  onClick: (genre: string) => void;
}

export const Genres = ['any', 'pop', 'rock', 'hip-hop', 'jazz', 'country', 'electronic'];

export const ListGenres: React.FC<ListGenreProps> = ({ genres, onClick }) => {
  const [genre, setGenre] = React.useState<string>('any');

  const handleGenreChange = (label: string) => {
    setGenre(label);
    onClick(label);
  }

  return (
    <ul>
      {genres.map((genre) => (
        <li key={genre} onClick={() => handleGenreChange(genre)}>
          {genre}
        </li>
      ))}
    </ul>
  )
}

export default ListGenres;
