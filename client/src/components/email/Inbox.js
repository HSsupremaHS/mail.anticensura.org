import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Inbox = () => {
  const { accountId } = useParams();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syncEmails();
  }, [accountId]);

  const syncEmails = async () => {
    try {
      await axios.post(`/api/emails/sync/${accountId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchEmails();
    } catch (err) {
      toast.error('Errore nella sincronizzazione');
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await axios.get(`/api/emails/${accountId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmails(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Errore nel caricamento delle email');
      setLoading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="inbox">
      <h2>Inbox</h2>
      <button onClick={syncEmails}>Sincronizza</button>
      <table>
        <thead>
          <tr>
            <th>Da</th>
            <th>Oggetto</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {emails.map(email => (
            <tr key={email.id}>
              <td>{email.from}</td>
              <td>{email.subject}</td>
              <td>{new Date(email.receivedDate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inbox;