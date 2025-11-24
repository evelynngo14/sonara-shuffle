import React from 'react';

export interface DecadeRange {
  [decade: string]: [minYear: number, maxYear: number];
}

export const Decades: DecadeRange = {
  'any': [1960, 2025],
  '1960s': [1960, 1969],
  '1970s': [1970, 1979],
  '1980s': [1980, 1989],
  '1990s': [1990, 1999],
  '2000s': [2000, 2009],
  '2010s': [2010, 2019],
  '2020s': [2020, 2025],
};

interface ListDecadesProps {
  decades: DecadeRange;
  onClick: (decade: string, range: [number, number]) => void;
}

export const ListDecades: React.FC<ListDecadesProps> = ({ decades, onClick }: ListDecadesProps) => {
  const [selectedDecade, setSelectedDecade] = React.useState<DecadeRange>({
    'any': [1960, 2025]
  })

  const handleDecadeSelect = (label: string, range: [number, number]) => {
    // Update local state so the UI updates (highlights button)
    setSelectedDecade({ [label]: range });

    // Send data back to parent component to trigger API logic
    onClick(label, range);
  }


  return (
    <ul className="list">
      {Object.entries(decades).map(([label, range]) => {
        return (
          <li className="buttons" key={label} onClick={() => handleDecadeSelect(label, range)}>
            {label}
          </li>
        )
      })}
    </ul>
  );
};

export default ListDecades;
