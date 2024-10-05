import { Automaton } from "../types/automaton";

export const simulateAutomaton = (
  automaton: Automaton,
  input: string
): boolean => {
  if (automaton.isDeterministic) {
    return simulateAFD(automaton, input);
  } else {
    return simulateAFND(automaton, input);
  }
};

const simulateAFD = (automaton: Automaton, input: string): boolean => {
  const startState = automaton.states.find((s) => s.isStart);
  if (!startState) return false;

  let currentState = startState.id;

  for (const symbol of input) {
    const state = currentState;
    const transition = automaton.transitions.find(
      (t) => t.from === state && t.input === symbol
    );
    if (!transition) return false;
    currentState = transition.to;
  }

  const finalState = automaton.states.find((s) => s.id === currentState);
  return finalState ? finalState.isAccept : false;
};

const simulateAFND = (automaton: Automaton, input: string): boolean => {
  const startStates = automaton.states
    .filter((s) => s.isStart)
    .map((s) => s.id);
  let currentStates = new Set<string>(startStates);

  for (const symbol of input) {
    const newStates = new Set<string>();
    currentStates.forEach((state) => {
      automaton.transitions
        .filter((t) => t.from === state && t.input === symbol)
        .forEach((t) => newStates.add(t.to));
    });
    currentStates = newStates;
    if (currentStates.size === 0) break;
  }

  return Array.from(currentStates).some((stateId) => {
    const state = automaton.states.find((s) => s.id === stateId);
    return state?.isAccept;
  });
};
