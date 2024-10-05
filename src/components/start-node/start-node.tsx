import React from "react";
import { Handle, Position } from "react-flow-renderer";

const StartNode: React.FC = () => {
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderTop: "10px solid transparent",
        borderBottom: "10px solid transparent",
        borderLeft: "20px solid #555",
      }}
    >
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export default StartNode;
