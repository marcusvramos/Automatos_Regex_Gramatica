// src/components/automaton-simulator/AutomatonSimulator.tsx

import React, { useState } from "react";
import { Automaton } from "../../types/automaton";
import { simulateAutomaton } from "../../utils/automaton-simulator";
import { Form, Button, Alert, Card } from "react-bootstrap";

interface AutomatonSimulatorProps {
  automaton: Automaton;
  setCurrentStates: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const AutomatonSimulator: React.FC<AutomatonSimulatorProps> = ({
  automaton,
  setCurrentStates,
}) => {
  const [inputWord, setInputWord] = useState<string>("");
  const [isStepByStep, setIsStepByStep] = useState<boolean>(false);
  const [currentStates, setLocalCurrentStates] = useState<Set<string>>(
    new Set()
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean>(false);

  const handleSimulate = () => {
    if (isStepByStep) {
      // Iniciar simulação passo a passo
      const startStates = new Set(
        automaton.states.filter((s) => s.isStart).map((s) => s.id)
      );
      setLocalCurrentStates(startStates);
      setCurrentStates(startStates);
      setCurrentIndex(0);
      setSimulationComplete(false);
      setAccepted(false);
    } else {
      // Simulação normal
      const isAccepted = simulateAutomaton(automaton, inputWord);
      setAccepted(isAccepted);
      setSimulationComplete(true);
    }
  };

  const handleNextStep = () => {
    if (simulationComplete) return;

    const symbol = inputWord[currentIndex];

    if (!symbol) {
      // Fim da palavra
      const isAccepted = Array.from(currentStates).some((stateId) => {
        const state = automaton.states.find((s) => s.id === stateId);
        return state?.isAccept;
      });
      setAccepted(isAccepted);
      setSimulationComplete(true);
      return;
    }

    // Encontrar transições possíveis
    const nextStates = new Set<string>();
    automaton.transitions.forEach((t) => {
      if (currentStates.has(t.from) && t.input === symbol) {
        nextStates.add(t.to);
      }
    });

    if (nextStates.size === 0) {
      // Sem transições possíveis
      setAccepted(false);
      setSimulationComplete(true);
      return;
    }

    setLocalCurrentStates(nextStates);
    setCurrentStates(nextStates);
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <Card className="p-3">
      <h2>Simulador de Autômato</h2>
      <Form>
        <Form.Group controlId="inputWord">
          <Form.Label>Entrada:</Form.Label>
          <Form.Control
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
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
          Simular
        </Button>
      </Form>
      {isStepByStep && (
        <div className="mt-4">
          <h4>Passo {currentIndex + 1}</h4>
          <p>
            <strong>Símbolo Atual:</strong> {inputWord[currentIndex] || "N/A"}
          </p>
          <p>
            <strong>Estados Atuais:</strong>{" "}
            {Array.from(currentStates)
              .map(
                (id) => automaton.states.find((s) => s.id === id)?.label || id
              )
              .join(", ")}
          </p>
          {!simulationComplete && (
            <Button variant="primary" onClick={handleNextStep}>
              Próximo Passo
            </Button>
          )}
          {simulationComplete && (
            <Alert
              variant={accepted ? "success" : "danger"}
              className="mt-3"
            >
              Resultado: {accepted ? "Aceita" : "Rejeitada"}
            </Alert>
          )}
        </div>
      )}
      {!isStepByStep && simulationComplete && (
        <Alert variant={accepted ? "success" : "danger"} className="mt-3">
          Resultado: {accepted ? "Aceita" : "Rejeitada"}
        </Alert>
      )}
    </Card>
  );
};

export default AutomatonSimulator;
