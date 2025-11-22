import React from "react";

interface ListGenreProps {
  genres: string[];
  onSelect: (genre: string) => void;
}

export const ListGenres: React.FC<ListGenreProps> = ({ genres, onSelect }) => {
  return (
    <div>
      <ul className="list">
        {genres.map((genre, index) => (
          <li className="buttons" key={index} onClick={() => onSelect(genre)}>
            {genre}
          </li>
        ))}
      </ul>
    </div>
  )
}
