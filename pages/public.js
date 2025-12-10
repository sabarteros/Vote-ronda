import { useEffect, useState } from 'react';

export default function PublicPage() {
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [rawCount, setRawCount] = useState(0);

  useEffect(()=>{
    fetch('/votes.json').then(r=>{
      if (!r.ok) throw new Error('Not found');
      return r.json();
    }).then(data=>{
      setRawCount(Array.isArray(data) ? data.length : 0);
      const counts = {};
      (data || []).forEach(v=>{
        counts[v.choice] = (counts[v.choice] || 0) + 1;
      });
      setTotals(counts);
    }).catch((e)=>{
      setTotals({});
    }).finally(()=>setLoading(false));
  },[]);

  return (
    <div>
      <div className="container">
        <div className="header">
          <div className="header-overlay" />
          <h1>Hasil Voting (Publik)</h1>
        </div>

        <div style={{height:12}} />

        <div className="card">
          <h3>Hasil</h3>
          <p className="small">Dapat dilihat tanpa login. Total suara: {rawCount}</p>

          {loading ? <div className="small">Memuat...</div> : (
            <div className="results-grid">
              {Object.keys(totals).length === 0 ? (
                <div className="small">Belum ada suara.</div>
              ) : Object.keys(totals).map(k => (
                <div className="result-item" key={k}>
                  <div style={{fontWeight:700}}>{k}</div>
                  <div style={{fontSize:24, marginTop:6}}>{totals[k]}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:12}}>
            <a href="/" className="btn">Kembali ke Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
