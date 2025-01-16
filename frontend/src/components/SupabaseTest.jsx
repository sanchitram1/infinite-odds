import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const SupabaseTest = () => {
  const [flips, setFlips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFlips = async () => {
      try {
        const { data, error } = await supabase
          .from('flips')
          .select('*')
            .limit(10);
        
        console.log(data);

        if (error) throw error;
        setFlips(data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchFlips();
  }, []);

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Recent Flips</h1>
      {flips.length === 0 ? (
        <p>No flips found</p>
      ) : (
        <ul>
          {flips.map((flip) => (
            <li key={flip.id}>
              Flip ID: {flip.id} - Result: {flip.result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SupabaseTest; 