import React from "react";
import { Handle, Position, NodeProps } from "react-flow-renderer";
import "./state-node.css";

interface CustomNodeData {
  label: string;
  isAccept: boolean;
}

const StateNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  return (
    <div className={`state-node ${data.isAccept ? "accept" : "default"}`}>
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default StateNode;
