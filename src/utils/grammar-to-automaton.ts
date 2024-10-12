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
      isAccept: false,
    });
  });

  // Criar um estado de aceitação adicional
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
      if (body === "ε") {
        // Produção com ε (vazio): marcar o estado como final
        const state = states.find((s) => s.id === fromStateId);
        if (state) {
          state.isAccept = true;
        }
      } else {
        if (body.length === 2) {
          const terminal = body[0];
          const nonTerminal = body[1];
          // Transição para outro estado
          transitions.push({
            id: `t_${fromStateId}_${nonTerminal}_${terminal}`,
            from: fromStateId,
            to: `state_${nonTerminal}`,
            input: terminal,
          });
        } else if (body.length === 1) {
          const terminal = body[0];
          // Transição para estado de aceitação
          transitions.push({
            id: `t_${fromStateId}_accept_${terminal}`,
            from: fromStateId,
            to: acceptState.id,
            input: terminal,
          });
        } else {
          console.warn(`Produção inválida: ${prod.head} → ${body}`);
        }
      }
    });
  });

  return {
    states,
    transitions,
    isDeterministic: false,
  };
};
