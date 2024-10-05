import React, { useState } from "react";
import { Grammar, Production } from "../../types/grammar";
import {
  Form,
  Button,
  ListGroup,
  Card,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";

interface GrammarEditorProps {
  onSubmit: (grammar: Grammar) => void;
}

const GrammarEditor: React.FC<GrammarEditorProps> = ({ onSubmit }) => {
  const [grammar, setGrammar] = useState<Grammar>({
    startSymbol: "",
    nonTerminals: [],
    terminals: [],
    productions: [],
  });

  const [production, setProduction] = useState<Production>({
    head: "",
    body: [],
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProductionIndex, setCurrentProductionIndex] = useState<
    number | null
  >(null);

  const handleAddProduction = () => {
    if (production.head && production.body.length > 0) {
      setGrammar((prev) => ({
        ...prev,
        productions: [...prev.productions, production],
        nonTerminals: prev.nonTerminals.includes(production.head)
          ? prev.nonTerminals
          : [...prev.nonTerminals, production.head],
        terminals: [
          ...Array.from(
            new Set([
              ...prev.terminals,
              ...production.body.filter((sym) => !/^[A-Z]$/.test(sym)),
            ])
          ),
        ],
      }));
      setProduction({ head: "", body: [] });
    } else {
      alert("Cabeça e corpo da produção não podem estar vazios.");
    }
  };

  const handleRemoveProduction = (index: number) => {
    setGrammar((prev) => ({
      ...prev,
      productions: prev.productions.filter((_, i) => i !== index),
      // Atualizar não-terminais e terminais
      nonTerminals: Array.from(
        new Set(
          prev.productions.filter((_, i) => i !== index).map((p) => p.head)
        )
      ),
      terminals: Array.from(
        new Set(
          prev.productions
            .filter((_, i) => i !== index)
            .flatMap((p) => p.body.filter((sym) => !/^[A-Z]$/.test(sym)))
        )
      ),
    }));
  };

  const handleEditProduction = (index: number) => {
    const prod = grammar.productions[index];
    setProduction({ head: prod.head, body: [...prod.body] });
    setCurrentProductionIndex(index);
    setShowModal(true);
  };

  const handleUpdateProduction = () => {
    if (currentProductionIndex === null) return;

    const updatedProductions = grammar.productions.map((prod, index) =>
      index === currentProductionIndex ? production : prod
    );

    setGrammar((prev) => ({
      ...prev,
      productions: updatedProductions,
      nonTerminals: Array.from(new Set(updatedProductions.map((p) => p.head))),
      terminals: Array.from(
        new Set(
          updatedProductions.flatMap((p) =>
            p.body.filter((sym) => !/^[A-Z]$/.test(sym))
          )
        )
      ),
    }));

    setProduction({ head: "", body: [] });
    setCurrentProductionIndex(null);
    setShowModal(false);
  };

  const handleSubmitGrammar = () => {
    if (grammar.startSymbol && grammar.productions.length > 0) {
      onSubmit(grammar);
    } else {
      alert("Gramática deve ter símbolo inicial e pelo menos uma produção.");
    }
  };

  return (
    <div>
      <h2>Editor de Gramáticas Regulares</h2>
      <Card className="p-3 mb-3">
        <Form>
          <Form.Group controlId="startSymbol" className="mb-3">
            <Form.Label>Símbolo Inicial:</Form.Label>
            <Form.Control
              type="text"
              value={grammar.startSymbol}
              onChange={(e) =>
                setGrammar({ ...grammar, startSymbol: e.target.value })
              }
              placeholder="Ex: S"
              required
            />
          </Form.Group>
          <h3>Produções</h3>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group controlId="productionHead" className="mb-3">
                <Form.Label>Cabeça:</Form.Label>
                <Form.Control
                  type="text"
                  value={production.head}
                  onChange={(e) =>
                    setProduction({ ...production, head: e.target.value })
                  }
                  placeholder="Ex: S"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="productionBody" className="mb-3">
                <Form.Label>Corpo:</Form.Label>
                <Form.Control
                  type="text"
                  value={production.body.join(" ")}
                  onChange={(e) =>
                    setProduction({
                      ...production,
                      body: e.target.value.split(" "),
                    })
                  }
                  placeholder="Ex: a S | b"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="primary"
                onClick={handleAddProduction}
                className="mt-1"
              >
                Adicionar Produção
              </Button>
            </Col>
          </Row>
          <ListGroup>
            {grammar.productions.map((prod, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{prod.head}</strong> →{" "}
                  {prod.body.map((sym, i) => (
                    <span key={i} className="me-1">
                      {/^[A-Z]$/.test(sym) ? (
                        <Badge bg="info">{sym}</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">
                          {sym}
                        </Badge>
                      )}
                    </span>
                  ))}
                </div>
                <div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleEditProduction(index)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleRemoveProduction(index)}
                  >
                    Remover
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button
            variant="success"
            onClick={handleSubmitGrammar}
            className="mt-3"
          >
            Submeter Gramática
          </Button>
        </Form>
      </Card>

      {/* Modal para Editar Produção */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Produção</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editProductionHead" className="mb-3">
              <Form.Label>Cabeça:</Form.Label>
              <Form.Control
                type="text"
                value={production.head}
                onChange={(e) =>
                  setProduction({ ...production, head: e.target.value })
                }
                placeholder="Ex: S"
              />
            </Form.Group>
            <Form.Group controlId="editProductionBody" className="mb-3">
              <Form.Label>Corpo:</Form.Label>
              <Form.Control
                type="text"
                value={production.body.join(" ")}
                onChange={(e) =>
                  setProduction({
                    ...production,
                    body: e.target.value.split(" "),
                  })
                }
                placeholder="Ex: a S | b"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateProduction}>
            Atualizar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GrammarEditor;
