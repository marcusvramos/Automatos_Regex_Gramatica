import { Automaton, Transition } from "../types/automaton";

export const simulateAutomaton = (
  automaton: Automaton,
  input: string
): boolean => {
  const { states, transitions } = automaton;

  const startStates = states.filter((s) => s.isStart).map((s) => s.id);

  let currentStates = epsilonClosure(new Set(startStates), transitions);

  for (const symbol of input) {
    const nextStates = new Set<string>();

    for (const stateId of currentStates) {
      transitions
        .filter((t) => t.from === stateId && t.input === symbol)
        .forEach((t) => {
          nextStates.add(t.to);
        });
    }

    if (nextStates.size === 0) {
      return false; // Não há transições possíveis
    }

    currentStates = epsilonClosure(nextStates, transitions);
  }

  // Verificar se algum dos estados atuais é de aceitação
  return Array.from(currentStates).some((stateId) => {
    const state = states.find((s) => s.id === stateId);
    return state?.isAccept;
  });
};

const epsilonClosure = (states: Set<string>, transitions: Transition[]): Set<string> => {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const stateId = stack.pop()!;
    transitions
      .filter((t) => t.from === stateId && t.input === "ε")
      .forEach((t) => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }

  return closure;
};
