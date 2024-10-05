// src/components/SelfLoopEdge.tsx
import React from 'react';
import { getBezierPath, EdgeProps } from 'react-flow-renderer';

const SelfLoopEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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
          <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default SelfLoopEdge;
