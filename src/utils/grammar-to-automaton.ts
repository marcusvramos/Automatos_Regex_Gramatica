import { Automaton, State, Transition } from "../types/automaton";
import { Grammar } from "../types/grammar";

export const grammarToAutomaton = (grammar: Grammar): Automaton => {
  const states: State[] = [];
  const transitions: Transition[] = [];

  // Criar estados para cada não-terminal
  grammar.nonTerminals.forEach((nt) => {
    states.push({
      id: `state_${nt}`,
      label: nt,
      isStart: nt === grammar.startSymbol,
      isAccept: false, // Marcaremos depois
    });
  });

  // Estado de aceitação
  const acceptState: State = {
    id: "accept_state",
    label: "q_accept",
    isStart: false,
    isAccept: true,
  };
  states.push(acceptState);

  // Construir transições
  grammar.productions.forEach((prod) => {
    const fromStateId = `state_${prod.head}`;

    prod.body.forEach((body) => {
      const symbols = body.split(" "); // Supondo que os símbolos estejam separados por espaço

      if (symbols.length === 2) {
        const [terminal, nonTerminal] = symbols;
        // Transição para outro estado
        transitions.push({
          id: `t_${fromStateId}_${nonTerminal}_${terminal}`,
          from: fromStateId,
          to: `state_${nonTerminal}`,
          input: terminal,
        });
      } else if (symbols.length === 1) {
        const [terminal] = symbols;
        // Transição para estado de aceitação
        transitions.push({
          id: `t_${fromStateId}_accept_${terminal}`,
          from: fromStateId,
          to: acceptState.id,
          input: terminal,
        });
      } else if (symbols.length === 0) {
        // Produção com ε (vazio)
        transitions.push({
          id: `t_${fromStateId}_accept_ε`,
          from: fromStateId,
          to: acceptState.id,
          input: "ε",
        });
      }
    });
  });

  return {
    states,
    transitions,
    isDeterministic: false, // A conversão geralmente resulta em um AFND
  };
};
