import React from "react";
import { Handle, Position, NodeProps } from "react-flow-renderer";
import "./state-node.css";

interface CustomNodeData {
  label: string;
  isAccept: boolean;
  isActive?: boolean;
}

const StateNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const nodeClass = `state-node ${data.isAccept ? "accept" : "default"} ${
    data.isActive ? "active" : ""
  }`;
  return (
    <div className={nodeClass}>
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default StateNode;
