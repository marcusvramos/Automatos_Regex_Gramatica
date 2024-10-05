export interface State {
  id: string;
  label: string;
  isStart: boolean;
  isAccept: boolean;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  input: string;
}

export interface Automaton {
  states: State[];
  transitions: Transition[];
  isDeterministic: boolean;
}