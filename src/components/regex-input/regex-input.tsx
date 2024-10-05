import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface RegexInputProps {
  onSubmit: (regex: string) => void;
}

const RegexInput: React.FC<RegexInputProps> = ({ onSubmit }) => {
  const [regex, setRegex] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(regex);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="regexInput">
        <Form.Label>Expressão Regular:</Form.Label>
        <Form.Control
          type="text"
          value={regex}
          onChange={(e) => setRegex(e.target.value)}
          placeholder="Ex: (a|b).(a|b).(a|b)"
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-3">
        Simular
      </Button>
    </Form>
  );
};

export default RegexInput;
