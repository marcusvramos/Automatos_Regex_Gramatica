// src/App.tsx

import React, { useState } from "react";
import { Container, Tabs, Tab, Card } from "react-bootstrap";
import { Automaton } from "./types/automaton";
import { Grammar } from "./types/grammar";
import "./App.css";
import RegexInput from "./components/regex-input/regex-input";
import RegexSimulator from "./components/regex-simulator/regex-simulator";
import AutomatonEditor from "./components/automaton-editor/automaton-editor";
import AutomatonSimulator from "./components/automator-simulator/automaton-simulator";
import GrammarEditor from "./components/grammar-editor/grammar-editor";
import { grammarToAutomaton } from "./utils/grammar-to-automaton";
import {
  FaRegKeyboard,
  FaRegEdit,
  FaRegFileCode,
} from "react-icons/fa";

const App: React.FC = () => {
  const [regex, setRegex] = useState<string>("");
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
    isDeterministic: true,
  });
  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [currentStates, setCurrentStates] = useState<Set<string>>(new Set());

  const handleGrammarSubmit = (grammar: Grammar) => {
    setGrammar(grammar);
    const afd = grammarToAutomaton(grammar);
    setAutomaton(afd);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Simulador de Linguagens Regulares</h1>
      <Tabs defaultActiveKey="regex" id="app-tabs" className="mb-3" fill>
        {/* Aba de Expressões Regulares */}
        <Tab
          eventKey="regex"
          title={
            <span>
              <FaRegKeyboard /> Expressões Regulares
            </span>
          }
        >
          <Card className="p-3">
            {!regex ? (
              <RegexInput onSubmit={setRegex} />
            ) : (
              <RegexSimulator regex={regex} />
            )}
          </Card>
        </Tab>
        {/* Aba de Autômatos Finitos */}
        <Tab
          eventKey="automaton"
          title={
            <span>
              <FaRegEdit /> Autômatos Finitos
            </span>
          }
        >
          <AutomatonEditor
            currentStates={currentStates}
            automaton={automaton}
            setAutomaton={setAutomaton}
          />
          {automaton && (
            <AutomatonSimulator
              automaton={automaton}
              setCurrentStates={setCurrentStates}
            />
          )}
        </Tab>
        {/* Aba de Gramáticas Regulares */}
        <Tab
          eventKey="grammar"
          title={
            <span>
              <FaRegFileCode /> Gramáticas Regulares
            </span>
          }
        >
          <Card className="p-3 mb-3">
            <GrammarEditor onSubmit={handleGrammarSubmit} />
          </Card>
          {grammar && (
            <Card className="p-3">
              <h4>Gramática Submetida:</h4>
              <p>
                <strong>Símbolo Inicial:</strong> {grammar.startSymbol}
              </p>
              <p>
                <strong>Não-terminais:</strong>{" "}
                {grammar.nonTerminals.join(", ")}
              </p>
              <p>
                <strong>Terminais:</strong> {grammar.terminals.join(", ")}
              </p>
              <h5>Produções:</h5>
              <ul>
                {grammar.productions.map((prod, index) => (
                  <li key={index}>
                    {prod.head} → {prod.body.join(" | ")}
                  </li>
                ))}
              </ul>
              {/* Mostrar o autômato resultante da gramática */}
              {automaton && (
                <div className="mt-4">
                  <h4>Autômato Gerado:</h4>
                  <AutomatonSimulator
                    automaton={automaton}
                    setCurrentStates={setCurrentStates}
                  />
                </div>
              )}
            </Card>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default App;
