import React from "react";

export interface ListGenreProps {
  genres: string[];
  onClick: (label: string) => void;
}

export const Genres = ['any', 'pop', 'rock', 'hip-hop', 'jazz', 'country', 'electronic'];

export const ListGenres: React.FC<ListGenreProps> = ({ genres, onClick }) => {
  const [genre, setGenre] = React.useState<string>('any');

  const handleGenreChange = (label: string) => {
    setGenre(label);
    onClick(label);
  }

  return (
    <ul className="list">
      {genres.map((label) => (
        <button
          className={genre === label ? 'selected button' : 'button'}
          key={label}
          onClick={() => handleGenreChange(label)}
        >
          {label}
        </button>
      ))}
    </ul>
  )
}

export default ListGenres;
