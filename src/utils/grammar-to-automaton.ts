// src/utils/grammarToAutomaton.ts
import { Grammar } from "../types/grammar";
import { Automaton, Transition, State } from "../types/automaton";

export const grammarToAutomaton = (grammar: Grammar): Automaton => {
  // Criação dos estados a partir dos não-terminais
  const states: State[] = grammar.nonTerminals.map((nt) => ({
    id: nt,
    label: nt,
    isStart: nt === grammar.startSymbol,
    isAccept: false,
  }));

  // Adição do estado ACCEPT para lidar com terminais que não levam a outro não-terminal
  states.push({
    id: "ACCEPT",
    label: "ACCEPT",
    isStart: false,
    isAccept: true,
  });

  // Inicialização de um contador para gerar IDs únicos para transições
  let transitionCounter = 0;

  // Criação das transições a partir das produções
  const transitions: Transition[] = grammar.productions.flatMap((prod) =>
    prod.body.map((symbol) => {
      transitionCounter += 1;
      return {
        id: `t_${prod.head}_${symbol}_${transitionCounter}`, // ID único
        from: prod.head,
        to:
          symbol.length === 1 && /[A-Z]/.test(symbol)
            ? symbol
            : "ACCEPT",
        input: symbol.length === 1 ? symbol : "ε", // Substituído 'symbol' por 'input'
      };
    })
  );

  return {
    states,
    transitions,
    isDeterministic: true, // Por padrão, iniciamos com AFD
  };
};
