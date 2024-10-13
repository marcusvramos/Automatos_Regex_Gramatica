import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge as RFEdge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "react-flow-renderer";
import { Automaton, State, Transition } from "../../types/automaton";
import {
  Button,
  Card,
  ListGroup,
  Row,
  Col,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import "react-flow-renderer/dist/style.css";
import "react-flow-renderer/dist/theme-default.css";
import "./automaton-editor.css";

import StateNode from "../state-node/state-node";
import StartNode from "../start-node/start-node";
import SelfLoopEdge from "../self-loop-edge/self-loop-edge";
import CustomEdge from "../custom-edge/custom-edge";

interface CustomNodeData {
  label: string;
  isAccept: boolean;
  isActive?: boolean;
}

const nodeTypes = {
  stateNode: StateNode,
  startNode: StartNode,
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
  custom: CustomEdge,
};

interface AutomatonEditorProps {
  currentStates: Set<string>;
  automaton: Automaton;
  setAutomaton: React.Dispatch<React.SetStateAction<Automaton>>;
}

const AutomatonEditor: React.FC<AutomatonEditorProps> = ({
  currentStates,
  automaton,
  setAutomaton,
}) => {
  // Inicializar nós com base nos estados do autômato
  const initialNodes: Node<CustomNodeData>[] = automaton.states.map(
    (state, index) => ({
      id: state.id,
      data: { label: state.label, isAccept: state.isAccept },
      position: { x: 250, y: 75 * (index + 1) },
      type: "stateNode",
    })
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge[]>([]);

  const [isDeterministic, setIsDeterministic] = useState<boolean>(
    automaton.isDeterministic
  );

  // Estados para o formulário de transição
  const [transitionFrom, setTransitionFrom] = useState<string>("");
  const [transitionTo, setTransitionTo] = useState<string>("");
  const [transitionInput, setTransitionInput] = useState<string>("");

  // Estados para o modal de renomear
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [currentStateId, setCurrentStateId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<string>("");

  // Atualizar os nós com base nos estados atuais e estados do autômato
  useEffect(() => {
    const updatedNodes = nodes.map((node) => {
      const state = automaton.states.find((s) => s.id === node.id);
      return {
        ...node,
        data: {
          ...node.data,
          isAccept: state?.isAccept || false,
          isActive: currentStates.has(node.id),
        },
      };
    });
    setNodes(updatedNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStates, automaton.states]);

  // Atualizar o autômato quando isDeterministic mudar
  useEffect(() => {
    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      isDeterministic,
    }));
  }, [isDeterministic, setAutomaton]);

  // Função para adicionar transições
  const handleAddTransition = (from: string, to: string, input: string) => {
    const symbols = input
      .split(",")
      .map((sym) => sym.trim())
      .filter((sym) => sym.length > 0);

    if (isDeterministic) {
      // Verificar se já existe uma transição com o mesmo símbolo a partir do estado 'from'
      for (const sym of symbols) {
        const existingTransition = automaton.transitions.find(
          (t) => t.from === from && t.input === sym
        );
        if (existingTransition) {
          alert(
            `Transição inválida: já existe uma transição do estado ${from} com o símbolo '${sym}'.`
          );
          return;
        }
      }
    }

    const newTransitions: Transition[] = symbols.map((sym) => ({
      id: `t_${from}_${to}_${sym}`, // ID único
      from,
      to,
      input: sym,
    }));

    // Atualizar o estado do autômato
    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      transitions: [...prevAutomaton.transitions, ...newTransitions],
    }));

    // Atualizar as arestas no React Flow
    setEdges((eds) => {
      const updatedEdges = [...eds];
      const edgeId = `e_${from}_${to}`;
      const reverseEdgeId = `e_${to}_${from}`;
      const existingEdgeIndex = updatedEdges.findIndex(
        (edge) => edge.id === edgeId
      );

      const newSymbols = symbols;

      if (existingEdgeIndex !== -1) {
        // Aresta já existe, atualizar o rótulo
        const existingEdge = updatedEdges[existingEdgeIndex];
        const existingSymbols = existingEdge.label
          ? typeof existingEdge.label === "string"
            ? existingEdge.label.split(",")
            : []
          : [];
        const combinedSymbols = Array.from(
          new Set([...existingSymbols, ...newSymbols])
        );
        existingEdge.label = combinedSymbols.join(",");
        updatedEdges[existingEdgeIndex] = { ...existingEdge };
      } else {
        // Verificar se existe uma aresta no sentido oposto
        const reverseEdgeExists = updatedEdges.some(
          (edge) => edge.id === reverseEdgeId
        );

        if (from !== to) {
          if (reverseEdgeExists) {
            const reverseEdgeIndex = updatedEdges.findIndex(
              (edge) => edge.id === reverseEdgeId
            );
            if (reverseEdgeIndex !== -1) {
              const reverseEdge = updatedEdges[reverseEdgeIndex];
              reverseEdge.type = "custom";
              updatedEdges[reverseEdgeIndex] = { ...reverseEdge };
            }
          }
        }

        updatedEdges.push({
          id: edgeId,
          source: from,
          target: to,
          label: newSymbols.join(","),
          animated: !isDeterministic,
          type: from === to ? "selfLoop" : "custom",
          style: { stroke: "#000" },
          labelStyle: { fill: "#000", fontWeight: 700 },
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#fff", opacity: 0.7 },
          markerEnd: MarkerType.Arrow,
        });
      }

      return updatedEdges;
    });
  };

  // Função para lidar com a submissão do formulário de transição
  const handleSubmitTransition = (e: React.FormEvent) => {
    e.preventDefault();
    if (transitionFrom && transitionTo && transitionInput) {
      handleAddTransition(transitionFrom, transitionTo, transitionInput);
      setTransitionFrom("");
      setTransitionTo("");
      setTransitionInput("");
    }
  };

  // Função para adicionar estados
  const handleAddState = () => {
    setAutomaton((prevAutomaton) => {
      const newStateNumber = prevAutomaton.states.length + 1;
      const newState: State = {
        id: `state_${newStateNumber}`,
        label: `q${newStateNumber}`,
        isStart: false,
        isAccept: false,
      };

      setNodes((nds) => [
        ...nds,
        {
          id: newState.id,
          data: { label: newState.label, isAccept: newState.isAccept },
          position: { x: 250, y: 75 * newStateNumber },
          type: "stateNode",
        },
      ]);

      return {
        ...prevAutomaton,
        states: [...prevAutomaton.states, newState],
      };
    });
  };

  // Função para remover estados
  const handleRemoveState = (stateId: string) => {
    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      states: prevAutomaton.states.filter((s) => s.id !== stateId),
      transitions: prevAutomaton.transitions.filter(
        (t) => t.from !== stateId && t.to !== stateId
      ),
    }));

    setNodes((nds) => nds.filter((node) => node.id !== stateId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== stateId && edge.target !== stateId)
    );
  };

  // Função para alternar estado de aceitação
  const toggleAcceptState = (stateId: string) => {
    setAutomaton((prevAutomaton) => {
      const updatedStates = prevAutomaton.states.map((s) =>
        s.id === stateId ? { ...s, isAccept: !s.isAccept } : s
      );

      return {
        ...prevAutomaton,
        states: updatedStates,
      };
    });
  };

  // Função para alternar estado inicial
  const toggleStartState = (stateId: string) => {
    setAutomaton((prevAutomaton) => {
      const updatedStates = prevAutomaton.states.map((s) =>
        s.id === stateId ? { ...s, isStart: !s.isStart } : s
      );

      return {
        ...prevAutomaton,
        states: updatedStates,
      };
    });
  };

  // Função para lidar com o clique nos nós
  const onNodeClickHandler = (
    event: React.MouseEvent,
    node: Node<CustomNodeData>
  ) => {
    const action = window.prompt(
      "Digite 'r' para remover, 'a' para alternar aceitação, 'n' para renomear ou 'i' para alternar estado inicial:"
    );
    if (action === "r") {
      handleRemoveState(node.id);
    } else if (action === "a") {
      toggleAcceptState(node.id);
    } else if (action === "n") {
      handleRenameState(node.id);
    } else if (action === "i") {
      toggleStartState(node.id);
    }
  };

  // Função para renomear estados
  const handleRenameState = (stateId: string) => {
    setCurrentStateId(stateId);
    const node = nodes.find((n) => n.id === stateId);
    if (node) {
      setNewLabel(node.data.label);
      setShowRenameModal(true);
    }
  };

  // Função para atualizar o label do estado
  const handleUpdateLabel = () => {
    if (currentStateId === null) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === currentStateId
          ? {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            }
          : node
      )
    );

    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      states: prevAutomaton.states.map((s) =>
        s.id === currentStateId ? { ...s, label: newLabel } : s
      ),
    }));

    setShowRenameModal(false);
    setCurrentStateId(null);
    setNewLabel("");
  };

  // Definição do onConnectHandler
  const onConnectHandler = (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    // Solicitar ao usuário os símbolos de entrada
    const inputSymbols = window.prompt(
      "Digite o(s) símbolo(s) de entrada para essa transição (separados por vírgulas):",
      "a,b"
    );

    if (inputSymbols === null || inputSymbols.trim() === "") {
      // Usuário cancelou ou não inseriu um símbolo válido
      return;
    }

    handleAddTransition(connection.source, connection.target, inputSymbols);
  };

  // Criar Nodos de Start e Edges de Start para Estados Iniciais
  const startNodes: Node[] = automaton.states
    .filter((state) => state.isStart)
    .map((state) => ({
      id: `start_${state.id}`,
      type: "startNode",
      position: {
        x: (nodes.find((n) => n.id === state.id)?.position.x || 250) - 40,
        y: nodes.find((n) => n.id === state.id)?.position.y || 75,
      },
      data: {},
      style: {
        width: 30,
        height: 20,
        border: "none",
        background: "transparent",
      },
    }));

  const startEdges: RFEdge[] = automaton.states
    .filter((state) => state.isStart)
    .map((state) => ({
      id: `start_edge_${state.id}`,
      source: `start_${state.id}`,
      target: state.id,
      type: "smoothstep",
      arrowHeadType: "arrowclosed",
      animated: false,
      style: { stroke: "#555" },
    }));

  // Combinar Nodos e Edges
  const allNodes = [...nodes, ...startNodes];
  const allEdges = [...edges, ...startEdges];

  return (
    <Card className="p-3 mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h3>Editor de Autômatos Finitos</h3>
        <div className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="automaton-type-switch"
            label={isDeterministic ? "AFD" : "AFND"}
            checked={isDeterministic}
            onChange={(e) => setIsDeterministic(e.target.checked)}
            className="me-3"
          />
          <Button variant="primary" onClick={handleAddState}>
            Adicionar Estado
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <h4>Estados</h4>
            <ListGroup>
              {automaton.states.map((state) => (
                <ListGroup.Item
                  key={state.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{state.label}</strong>
                    {state.isStart && (
                      <Badge bg="success" className="ms-2">
                        Início
                      </Badge>
                    )}
                    {state.isAccept && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Aceitação
                      </Badge>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleRenameState(state.id)}
                    >
                      Renomear
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleRemoveState(state.id)}
                    >
                      Remover
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="ms-2"
                      onClick={() => toggleAcceptState(state.id)}
                    >
                      {state.isAccept
                        ? "Desmarcar Aceitação"
                        : "Marcar Aceitação"}
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => toggleStartState(state.id)}
                    >
                      {state.isStart ? "Desmarcar Inicial" : "Marcar Inicial"}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Formulário para Adicionar Transições */}
            <Row className="mt-4">
              <Col>
                <h4>Adicionar Transição</h4>
                <Form onSubmit={handleSubmitTransition}>
                  <Form.Group controlId="transitionFrom" className="mb-2">
                    <Form.Label>De:</Form.Label>
                    <Form.Select
                      value={transitionFrom}
                      onChange={(e) => setTransitionFrom(e.target.value)}
                      required
                    >
                      <option value="">Selecione o estado de origem</option>
                      {automaton.states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group controlId="transitionInput" className="mb-2">
                    <Form.Label>Símbolo(s) de Entrada:</Form.Label>
                    <Form.Control
                      type="text"
                      value={transitionInput}
                      onChange={(e) => setTransitionInput(e.target.value)}
                      placeholder="Ex: a,b"
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="transitionTo" className="mb-2">
                    <Form.Label>Para:</Form.Label>
                    <Form.Select
                      value={transitionTo}
                      onChange={(e) => setTransitionTo(e.target.value)}
                      required
                    >
                      <option value="">Selecione o estado de destino</option>
                      {automaton.states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button variant="success" type="submit">
                    Adicionar Transição
                  </Button>
                </Form>
              </Col>
            </Row>
          </Col>
          <Col md={8}>
            <Card className="p-2" style={{ height: "600px" }}>
              <ReactFlow
                nodes={allNodes}
                edges={allEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnectHandler}
                onNodeClick={onNodeClickHandler}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                style={{ width: "100%", height: "100%" }}
              >
                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX={15}
                      refY={5}
                      markerWidth={6}
                      markerHeight={6}
                      orient="auto"
                    >
                      <polygon points="0,0 10,5 0,10" fill="#000" />
                    </marker>
                  </defs>
                </svg>
                <Background />
                <Controls />
              </ReactFlow>
            </Card>
          </Col>
        </Row>
      </Card.Body>

      {/* Modal para Renomear Estado */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renomear Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="renameState" className="mb-3">
              <Form.Label>Novo Nome do Estado:</Form.Label>
              <Form.Control
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ex: q2"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateLabel}>
            Atualizar
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default AutomatonEditor;
