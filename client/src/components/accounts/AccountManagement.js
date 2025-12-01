import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('/api/accounts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccounts(res.data);
    } catch (err) {
      toast.error('Errore nel caricamento degli account');
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/accounts', { address: `${newAddress}@anticensura.org`, password: newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Account creato');
      fetchAccounts();
      setNewAddress('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Errore nella creazione');
    }
  };

  return (
    <div className="account-management">
      <h2>Gestione Account Email</h2>
      <form onSubmit={createAccount}>
        <input 
          type="text" 
          value={newAddress} 
          onChange={(e) => setNewAddress(e.target.value)} 
          placeholder="Nome account (senza @anticensura.org)" 
          required 
        />
        <input 
          type="password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Crea Account</button>
      </form>
      <h3>Account Esistenti</h3>
      <ul>
        {accounts.map(acc => (
          <li key={acc.id}>{acc.address} - {acc.isActive ? 'Attivo' : 'Inattivo'}</li>
        ))}
      </ul>
    </div>
  );
};

export default AccountManagement;