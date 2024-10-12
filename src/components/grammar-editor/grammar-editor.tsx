import React, { useState, useEffect } from "react";
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
  Alert,
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

  const [productionBody, setProductionBody] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProductionIndex, setCurrentProductionIndex] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const isValidProduction = (head: string, body: string[]): boolean => {
    const nonTerminalPattern = /^[A-Z]$/;
    const terminalPattern = /^[a-z]$/;
    const epsilon = "ε";

    for (let productionBody of body) {
      if (productionBody === epsilon) {
        continue;
      }
      if (productionBody.length === 1) {
        if (!terminalPattern.test(productionBody)) return false;
      } else if (productionBody.length === 2) {
        const [first, second] = productionBody;
        if (!terminalPattern.test(first) || !nonTerminalPattern.test(second)) return false;
      } else {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (grammar.startSymbol && !grammar.nonTerminals.includes(grammar.startSymbol)) {
      setGrammar((prev) => ({
        ...prev,
        nonTerminals: [...prev.nonTerminals, grammar.startSymbol],
      }));
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grammar.startSymbol]);

  const handleAddProduction = () => {
    setError(null);
    if (production.head && productionBody.length > 0) {
      const newBody = productionBody.split("|").map((sym) => sym.trim());

      if (!isValidProduction(production.head, newBody)) {
        setError(
          "Produções inválidas para uma Gramática Regular. Cada produção deve ser do tipo A → a ou A → aB, ou ε para a produção vazia."
        );
        return;
      }

      setGrammar((prev) => {
        const updatedProductions = [...prev.productions, { ...production, body: newBody }];
        const updatedNonTerminals = Array.from(
          new Set([
            ...prev.nonTerminals,
            production.head.toUpperCase(),
            ...newBody
              .filter((sym) => sym.length === 2)
              .map((sym) => sym[1].toUpperCase()), // Extrair não-terminal de produções como aS
          ])
        );
        const updatedTerminals = Array.from(
          new Set([
            ...prev.terminals,
            ...newBody
              .join("")
              .split("")
              .filter((sym) => /^[a-z]$/.test(sym)), // Apenas terminais
          ])
        );

        return {
          ...prev,
          productions: updatedProductions,
          nonTerminals: updatedNonTerminals,
          terminals: updatedTerminals,
        };
      });
      setProduction({ head: "", body: [] });
      setProductionBody("");
    } else {
      setError("Cabeça e corpo da produção não podem estar vazios.");
    }
  };

  const handleRemoveProduction = (index: number) => {
    setGrammar((prev) => {
      const updatedProductions = prev.productions.filter((_, i) => i !== index);
      const updatedNonTerminals = Array.from(new Set(updatedProductions.map((p) => p.head)));
      const updatedTerminals = Array.from(
        new Set(
          updatedProductions.flatMap((p) =>
            p.body.flatMap((sym) => (/[a-z]/.test(sym) ? sym : []))
          )
        )
      );

      if (prev.startSymbol && !updatedNonTerminals.includes(prev.startSymbol)) {
        updatedNonTerminals.push(prev.startSymbol);
      }

      return {
        ...prev,
        productions: updatedProductions,
        nonTerminals: updatedNonTerminals,
        terminals: updatedTerminals,
      };
    });
  };

  const handleEditProduction = (index: number) => {
    const prod = grammar.productions[index];
    setProduction({ head: prod.head, body: [...prod.body] });
    setProductionBody(prod.body.join(" | "));
    setCurrentProductionIndex(index);
    setShowModal(true);
  };

  const handleUpdateProduction = () => {
    if (currentProductionIndex === null) return;

    const newProductionBody = productionBody.split("|").map((term) => term.trim());

    if (!isValidProduction(production.head, newProductionBody)) {
      setError(
        "Produções inválidas para uma Gramática Regular. Cada produção deve ser do tipo A → a ou A → aB, ou ε para a produção vazia."
      );
      return;
    }

    setGrammar((prev) => {
      const updatedProductions = prev.productions.map((prod, index) =>
        index === currentProductionIndex ? { ...production, body: newProductionBody } : prod
      );

      const updatedNonTerminals = Array.from(
        new Set([
          ...updatedProductions.map((p) => p.head),
          ...newProductionBody
            .filter((sym) => sym.length === 2)
            .map((sym) => sym[1].toUpperCase()),
          prev.startSymbol,
        ])
      );

      const updatedTerminals = Array.from(
        new Set([
          ...updatedProductions.flatMap((p) =>
            p.body.flatMap((sym) => (/[a-z]/.test(sym) ? sym : []))
          ),
        ])
      );

      return {
        ...prev,
        productions: updatedProductions,
        nonTerminals: updatedNonTerminals,
        terminals: updatedTerminals,
      };
    });

    setProduction({ head: "", body: [] });
    setProductionBody(""); // Resetar o valor do corpo após a atualização
    setCurrentProductionIndex(null);
    setShowModal(false);
    setError(null);
  };

  const handleSubmitGrammar = () => {
    setError(null); // Resetar mensagem de erro
    if (grammar.startSymbol && grammar.productions.length > 0) {
      // Garantir que o símbolo inicial está incluído nos não-terminais
      if (!grammar.nonTerminals.includes(grammar.startSymbol)) {
        setError("O símbolo inicial deve estar incluído nos não-terminais.");
        return;
      }

      // Verificação adicional para garantir que a gramática é regular
      for (let prod of grammar.productions) {
        if (!isValidProduction(prod.head, prod.body)) {
          setError("A gramática contém produções inválidas para uma Gramática Regular.");
          return;
        }
      }
      onSubmit(grammar);
    } else {
      setError("Gramática deve ter símbolo inicial e pelo menos uma produção.");
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
                setGrammar({ ...grammar, startSymbol: e.target.value.toUpperCase() })
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
                    setProduction({ ...production, head: e.target.value.toUpperCase() })
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
                  value={productionBody}
                  onChange={(e) => setProductionBody(e.target.value)}
                  placeholder="Ex: aS | ε"
                />
              </Form.Group>
            </Col>
            <Col>
              <Button
                variant="primary"
                onClick={handleAddProduction}
                className="mb-3"
              >
                Adicionar Produção
              </Button>
            </Col>
          </Row>
          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}
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
                      {sym === "ε" ? (
                        <Badge bg="secondary">{sym}</Badge>
                      ) : /^[A-Z]$/.test(sym) ? (
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
                  setProduction({ ...production, head: e.target.value.toUpperCase() })
                }
                placeholder="Ex: S"
              />
            </Form.Group>
            <Form.Group controlId="editProductionBody" className="mb-3">
              <Form.Label>Corpo:</Form.Label>
              <Form.Control
                type="text"
                value={productionBody}
                onChange={(e) => setProductionBody(e.target.value)}
                placeholder="Ex: aS | b | ε"
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
