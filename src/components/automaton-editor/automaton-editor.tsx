import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge as RFEdge,
  Node,
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import { Automaton, State, Transition } from "../../types/automaton";
import { Button, Card, ListGroup, Row, Col, Badge, Modal, Form } from "react-bootstrap";
import "react-flow-renderer/dist/style.css"; 
import "react-flow-renderer/dist/theme-default.css";
import "./automaton-editor.css";

import StateNode from "../state-node/state-node";
import StartNode from "../start-node/start-node";
import SelfLoopEdge from "../self-loop-edge/self-loop-edge";

interface CustomNodeData {
  label: string;
  isAccept: boolean;
}

const nodeTypes = {
  stateNode: StateNode,
  startNode: StartNode,
};

const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

const AutomatonEditor: React.FC = () => {
  // Inicialização com um nó padrão
  const initialNodes: Node<CustomNodeData>[] = [
    {
      id: "state_1",
      data: { label: "q1", isAccept: false },
      position: { x: 250, y: 75 },
      type: "stateNode",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge[]>([]);
  const [automaton, setAutomaton] = useState<Automaton>({
    states: [
      {
        id: "state_1",
        label: "q1",
        isStart: true,
        isAccept: false,
      },
    ],
    transitions: [],
    isDeterministic: true, // Por padrão, iniciamos com AFD
  });

  // Estados para o formulário de transição
  const [transitionFrom, setTransitionFrom] = useState<string>("");
  const [transitionTo, setTransitionTo] = useState<string>("");
  const [transitionInput, setTransitionInput] = useState<string>("");

  // Estados para renomear
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [currentStateId, setCurrentStateId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState<string>("");

  // Função para adicionar transições
  const handleAddTransition = (from: string, to: string, input: string) => {
    const symbols = input.split(',').map(sym => sym.trim()).filter(sym => sym.length > 0);

    const newTransitions: Transition[] = symbols.map((sym, index) => ({
      id: `t_${from}_${to}_${sym}_${Date.now()}_${index}`, // ID único
      from,
      to,
      input: sym,
    }));

    // Atualizar o estado do autômato
    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      transitions: [...prevAutomaton.transitions, ...newTransitions],
    }));

    // Adicionar as transições no React Flow
    setEdges((eds) => [
      ...eds,
      ...newTransitions.map((transition) => ({
        id: transition.id,
        source: transition.from,
        target: transition.to,
        label: transition.input,
        animated: !automaton.isDeterministic,
        type: transition.from === transition.to ? 'selfLoop' : 'smoothstep',
        style: { stroke: '#000' },
        labelStyle: { fill: '#000', fontWeight: 700 },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#fff', opacity: 0.7 },
      })),
    ]);
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
        isStart: false, // Por padrão, novos estados não são iniciais
        isAccept: false,
      };

      setNodes((nds) => [
        ...nds,
        {
          id: newState.id,
          data: { label: newState.label, isAccept: newState.isAccept },
          position: { x: 250, y: 75 * newStateNumber },
          type: 'stateNode',
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
    setEdges((eds) => eds.filter((edge) => edge.source !== stateId && edge.target !== stateId));
  };

  // Função para alternar estado de aceitação
  const toggleAcceptState = (stateId: string) => {
    setAutomaton((prevAutomaton) => {
      const updatedStates = prevAutomaton.states.map((s) =>
        s.id === stateId ? { ...s, isAccept: !s.isAccept } : s
      );

      setNodes((nds) =>
        nds.map((node) =>
          node.id === stateId
            ? {
                ...node,
                data: {
                  ...node.data,
                  isAccept: updatedStates.find((s) => s.id === stateId)?.isAccept || false,
                },
              }
            : node
        )
      );

      return {
        ...prevAutomaton,
        states: updatedStates,
      };
    });
  };

  // Função para lidar com o clique nos nós
  const onNodeClickHandler = (event: React.MouseEvent, node: Node<CustomNodeData>) => {
    const action = window.prompt("Digite 'r' para remover, 'a' para alternar aceitação ou 'n' para renomear:");
    if (action === 'r') {
      handleRemoveState(node.id);
    } else if (action === 'a') {
      toggleAcceptState(node.id);
    } else if (action === 'n') {
      handleRenameState(node.id);
    }
  };

  // Função para renomear estados
  const handleRenameState = (stateId: string) => {
    setCurrentStateId(stateId);
    const node = nodes.find(n => n.id === stateId);
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

    // Gerar um ID único para a nova transição
    const transitionId = `t_${connection.source}_${connection.target}_${Date.now()}`;

    // Criar uma transição com um símbolo padrão (por exemplo, 'ε' ou outro)
    // Aqui, você pode solicitar ao usuário que insira o símbolo ou definir um padrão
    const symbol = window.prompt("Digite o símbolo de entrada para essa transição:", "a");

    if (symbol === null || symbol.trim() === "") {
      // Usuário cancelou ou não inseriu um símbolo válido
      return;
    }

    const newTransition: Transition = {
      id: transitionId,
      from: connection.source,
      to: connection.target,
      input: symbol.trim(),
    };

    // Atualizar o estado do autômato
    setAutomaton((prevAutomaton) => ({
      ...prevAutomaton,
      transitions: [...prevAutomaton.transitions, newTransition],
    }));

    // Adicionar a transição no React Flow
    setEdges((eds) => [
      ...eds,
      {
        id: newTransition.id,
        source: newTransition.from,
        target: newTransition.to,
        label: newTransition.input,
        animated: !automaton.isDeterministic,
        type: newTransition.from === newTransition.to ? 'selfLoop' : 'smoothstep',
        style: { stroke: '#000' },
        labelStyle: { fill: '#000', fontWeight: 700 },
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#fff', opacity: 0.7 },
      },
    ]);
  };

  // Criar Nodos de Start e Edges de Start para Estados Iniciais
  const startNodes: Node[] = automaton.states
    .filter((state) => state.isStart)
    .map((state) => ({
      id: `start_${state.id}`,
      type: 'startNode',
      position: { 
        x: (nodes.find(n => n.id === state.id)?.position.x || 250) - 40, // Ajuste o deslocamento conforme necessário
        y: nodes.find(n => n.id === state.id)?.position.y || 75 
      },
      data: {},
      style: { width: 30, height: 20, border: 'none', background: 'transparent' }, // Transparente além do SVG
    }));

  const startEdges: RFEdge[] = automaton.states
    .filter((state) => state.isStart)
    .map((state) => ({
      id: `start_edge_${state.id}`,
      source: `start_${state.id}`,
      target: state.id,
      type: 'smoothstep',
      arrowHeadType: 'arrowclosed',
      animated: false,
      style: { stroke: '#555' },
    }));

  // Combinar Nodos e Edges
  const allNodes = [...nodes, ...startNodes];
  const allEdges = [...edges, ...startEdges];

  return (
    <Card className="p-3 mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h3>Editor de Autômatos Finitos</h3>
        <Button variant="primary" onClick={handleAddState}>
          Adicionar Estado
        </Button>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <h4>Estados</h4>
            <ListGroup>
              {automaton.states.map((state) => (
                <ListGroup.Item key={state.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{state.label}</strong>
                    {state.isStart && <Badge bg="success" className="ms-2">Início</Badge>}
                    {state.isAccept && <Badge bg="warning" text="dark" className="ms-2">Aceitação</Badge>}
                  </div>
                  <div>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleRenameState(state.id)}>
                      Renomear
                    </Button>
                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleRemoveState(state.id)}>
                      Remover
                    </Button>
                    <Button variant="outline-info" size="sm" className="ms-2" onClick={() => toggleAcceptState(state.id)}>
                      {state.isAccept ? 'Desmarcar Aceitação' : 'Marcar Aceitação'}
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
                    <Form.Label>Símbolo de Entrada:</Form.Label>
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
                onConnect={onConnectHandler} // Uso do handler definido
                onNodeClick={onNodeClickHandler}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                style={{ width: "100%", height: "100%" }} // Definição de altura
              >
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
