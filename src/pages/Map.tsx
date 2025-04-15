import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

type Area = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  seats: number;
};

const areas: Area[] = [
  { id: 'A', x: 150, y: 100, width: 80, height: 100, color: '#ffb3b3', seats: 450 },
  { id: 'C', x: 170, y: 250, width: 200, height: 60, color: '#ffc2c2', seats: 1200 },
  { id: 'B', x: 320, y: 100, width: 80, height: 100, color: '#ffb3b3', seats: 450 }
];

const Map = () => {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  const handleClick = (area: Area) => {
    setSelectedArea(area);
    alert(`Khu vực ${area.id} có ${area.seats} chỗ ngồi`);
  };

  return (
    <Stage width={550} height={350}>
      <Layer>
        {/* STAGE */}
        <Rect x={150} y={40} width={250} height={50} fill="#a32424" cornerRadius={5} />
        <Text text="STAGE" x={150} y={50} width={250} align="center" fill="white" fontStyle="bold" fontSize={16} />

        {/* Phan truoc stage */}
        <Rect x={260} y={79} width={30} height={140} fill="#a32424" />
        <Rect x={230} y={210} width={90} height={30} fill="#a32424" />

        {/* SEAT AREAS */}
        {areas.map((area) => (
          <Group key={area.id} onClick={() => handleClick(area)}>
            <Rect
              x={area.x}
              y={area.y}
              width={area.width}
              height={area.height}
              fill={area.color}
              stroke={selectedArea?.id === area.id ? 'black' : undefined}
              strokeWidth={selectedArea?.id === area.id ? 2 : 0}
            />
            <Text
              text={area.id}
              x={area.x}
              y={area.y + area.height / 2 - 10}
              width={area.width}
              align="center"
              fontSize={18}
              fontStyle="bold"
              fill="#333"
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
};

export default Map;
