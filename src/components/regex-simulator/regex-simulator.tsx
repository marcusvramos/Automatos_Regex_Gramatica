import React, { useState } from 'react';
import XRegExp from 'xregexp';
import { Form, Button, Alert } from 'react-bootstrap';

interface RegexSimulatorProps {
  regex: string;
}

const RegexSimulator: React.FC<RegexSimulatorProps> = ({ regex }) => {
  const [input, setInput] = useState('');
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = () => {
    try {
      const pattern = XRegExp(`^${regex}$`);
      setIsMatch(XRegExp.test(input, pattern));
      setTimeout(() => {setError(null); setIsMatch(null) }, 3000);
      setError(null);
    } catch (error) {
      setError('Expressão Regular inválida.');
      setIsMatch(null);
    }
  };

  return (
    <div>
      <h2>Simulador de Expressão Regular</h2>
      <Form>
        <Form.Group controlId="regexInput">
          <Form.Label>Entrada:</Form.Label>
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: aba"
          />
        </Form.Group>
        <Button variant="success" onClick={handleCheck} className="mt-3">
          Verificar
        </Button>
      </Form>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {isMatch !== null && !error && (
        <Alert variant={isMatch ? "success" : "warning"} className="mt-3">
          Resultado: {isMatch ? 'Corresponde' : 'Não corresponde'}
        </Alert>
      )}
    </div>
  );
};

export default RegexSimulator;
