import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Compose = () => {
  const { accountId } = useParams();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/emails/send/${accountId}`, { to, subject, body }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Email inviata');
      setTo('');
      setSubject('');
      setBody('');
    } catch (err) {
      toast.error('Errore nell\'invio');
    }
  };

  return (
    <div className="compose">
      <h2>Scrivi Email</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={to} 
          onChange={(e) => setTo(e.target.value)} 
          placeholder="A" 
          required 
        />
        <input 
          type="text" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Oggetto" 
          required 
        />
        <textarea 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Corpo" 
          required 
        />
        <button type="submit">Invia</button>
      </form>
    </div>
  );
};

export default Compose;