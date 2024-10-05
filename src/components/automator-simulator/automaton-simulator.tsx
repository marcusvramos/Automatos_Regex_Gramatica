import React, { useState } from "react";
import { Automaton } from "../../types/automaton";
import { simulateAutomaton } from "../../utils/automaton-simulator";
import { Form, Button, Alert, Card, Row, Col } from "react-bootstrap";

interface AutomatonSimulatorProps {
  automaton: Automaton;
}

const AutomatonSimulator: React.FC<AutomatonSimulatorProps> = ({
  automaton,
}) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [currentStates, setCurrentStates] = useState<Set<string> | null>(null);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState<number>(0);
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean | null>(null);

  const handleSimulate = () => {
    if (isStepByStep) {
      // Reset states
      setCurrentStates(
        new Set(automaton.states.filter((s) => s.isStart).map((s) => s.id))
      );
      setCurrentSymbolIndex(0);
      setAccepted(null);
      setResult(null);
    } else {
      const isAccepted = simulateAutomaton(automaton, input);
      setResult(isAccepted);
      setAccepted(null);
      setCurrentStates(null);
      setCurrentSymbolIndex(0);
    }
  };

  const handleNextStep = () => {
    if (currentStates === null || currentSymbolIndex >= input.length) {
      // Finalizar simulação
      setAccepted(
        Array.from(currentStates || []).some((stateId) => {
          const state = automaton.states.find((s) => s.id === stateId);
          return state?.isAccept;
        })
      );
      return;
    }

    const symbol = input[currentSymbolIndex];
    const newStates = new Set<string>();

    automaton.transitions
      .filter((t) => currentStates.has(t.from) && t.input === symbol)
      .forEach((t) => newStates.add(t.to));

    setCurrentStates(newStates);
    setCurrentSymbolIndex((prev) => prev + 1);

    if (newStates.size === 0) {
      // Nenhuma transição possível
      setAccepted(false);
    }
  };

  return (
    <Card className="p-3">
      <h2>Simulador de Autômato</h2>
      <Form>
        <Form.Group controlId="inputString">
          <Form.Label>Entrada:</Form.Label>
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: aba"
          />
        </Form.Group>
        <Form.Check
          type="checkbox"
          label="Simulação Passo a Passo"
          checked={isStepByStep}
          onChange={(e) => setIsStepByStep(e.target.checked)}
          className="mt-2"
        />
        <Button variant="success" onClick={handleSimulate} className="mt-3">
          {isStepByStep ? "Iniciar Simulação" : "Simular"}
        </Button>
      </Form>
      {isStepByStep && currentStates !== null && (
        <div className="mt-4">
          <h4>Passo {currentSymbolIndex}:</h4>
          <Row>
            <Col md={6}>
              <p>
                <strong>Símbolo Atual:</strong>{" "}
                {currentSymbolIndex < input.length
                  ? input[currentSymbolIndex]
                  : "Nenhum"}
              </p>
              <p>
                <strong>Estados Atuais:</strong>{" "}
                {Array.from(currentStates)
                  .map((id) => {
                    const state = automaton.states.find((s) => s.id === id);
                    return state ? state.label : id;
                  })
                  .join(", ")}
              </p>
            </Col>
            <Col md={6} className="text-end">
              {currentSymbolIndex < input.length && (
                <Button variant="primary" onClick={handleNextStep}>
                  Próximo Passo
                </Button>
              )}
              {currentSymbolIndex >= input.length && accepted !== null && (
                <Alert
                  variant={accepted ? "success" : "danger"}
                  className="mt-3"
                >
                  Resultado: {accepted ? "Aceita" : "Rejeita"}
                </Alert>
              )}
            </Col>
          </Row>
        </div>
      )}
      {!isStepByStep && result !== null && (
        <Alert variant={result ? "success" : "danger"} className="mt-3">
          Resultado: {result ? "Aceita" : "Rejeita"}
        </Alert>
      )}
    </Card>
  );
};

export default AutomatonSimulator;
