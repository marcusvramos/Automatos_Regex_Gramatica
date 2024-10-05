export interface Production {
  head: string;
  body: string[];
}

export interface Grammar {
  startSymbol: string;
  nonTerminals: string[];
  terminals: string[];
  productions: Production[];
}
