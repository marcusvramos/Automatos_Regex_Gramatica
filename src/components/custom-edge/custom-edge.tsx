// src/components/custom-edge/CustomEdge.tsx

import React from 'react';
import { EdgeProps } from 'react-flow-renderer';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  label,
  markerEnd,
  data,
}) => {
  // Adjust curvature here
  const curvature = data?.curvature || 0; // default curvature is 0 (straight line)

  // Calculate the control points for the Bezier curve
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const centerX = sourceX + deltaX / 2;
  const centerY = sourceY + deltaY / 2;

  const cpX = centerX - curvature * deltaY;
  const cpY = centerY + curvature * deltaX;

  const edgePath = `M ${sourceX},${sourceY} Q ${cpX},${cpY} ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
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

export default CustomEdge;
