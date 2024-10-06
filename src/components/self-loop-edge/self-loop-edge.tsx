import React from 'react';
import { EdgeProps } from 'react-flow-renderer';

const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
}) => {
  // Define dimensões do quadrado com cantos arredondados
  const width = 30;
  const height = 30;
  const cornerRadius = 10;

  // Ajusta a posição inicial (iniciando na parte superior do nó) e o caminho para terminar no canto direito do nó alvo
  const loopPath = `
    M ${sourceX},${sourceY} 
    v -${height / 2} 
    h ${width - cornerRadius} 
    a ${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},${cornerRadius} 
    v ${height - 2 * cornerRadius} 
    a ${cornerRadius},${cornerRadius} 0 0 1 ${-cornerRadius},${cornerRadius} 
    h -${width - 2 * cornerRadius} 
    a ${cornerRadius},${cornerRadius} 0 0 1 ${-cornerRadius},${-cornerRadius} 
    v -${(height - 2 * cornerRadius) / 2} 
    L ${targetX},${targetY}
  `;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={loopPath}
        markerEnd={markerEnd}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default SelfLoopEdge;
