import React from 'react';
import { EdgeProps } from 'react-flow-renderer';

const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  style = {},
  label,
  markerEnd,
}) => {
  const loopSize = 60;
  const loopOffset = 45; 

  // Inverter os pontos de controle para alterar a direção do caminho
  const path = `
    M ${sourceX} ${sourceY}
    C ${sourceX - loopSize} ${sourceY - loopSize - loopOffset},
      ${sourceX + loopSize} ${sourceY - loopSize - loopOffset},
      ${sourceX} ${sourceY}
  `;

  return (
    <>
      <path
        id={id}
        style={style}
        d={path}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 12 }}
            startOffset="50%"
            textAnchor="middle"
          >
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default SelfLoopEdge;
