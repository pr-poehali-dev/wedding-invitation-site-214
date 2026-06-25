import { useEffect, useState } from 'react';
import func2url from '../../backend/func2url.json';

interface RsvpRow {
  id: number;
  name: string;
  attend: string;
  guests: number;
  wishes: string;
  created_at: string;
}

export default function Admin() {
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(func2url['rsvp-list'])
      .then(r => r.json())
      .then(data => setRows(data.responses || []))
      .finally(() => setLoading(false));
  }, []);

  const coming = rows.filter(r => r.attend === 'yes');
  const notComing = rows.filter(r => r.attend !== 'yes');
  const totalGuests = coming.reduce((s, r) => s + (r.guests || 1), 0);

  return (
    <div style={{ fontFamily: 'Georgia, serif', minHeight: '100vh', background: '#f9f6f3', padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ color: '#c0603a', fontSize: 28, marginBottom: 8 }}>Ответы гостей</h1>
        <p style={{ color: '#888', marginBottom: 32 }}>Максим и Екатерина · 7 августа 2026</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'Всего ответов', value: rows.length },
            { label: 'Придут', value: coming.length },
            { label: 'Не смогут', value: notComing.length },
            { label: 'Гостей всего', value: totalGuests },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e8ddd5', borderRadius: 12, padding: '16px 24px', minWidth: 140 }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#c0603a' }}>{s.value}</div>
              <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#aaa' }}>Загрузка...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: '#aaa' }}>Пока нет ответов</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e8ddd5', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f6f3' }}>
                  {['Имя', 'Присутствие', 'Гостей', 'Пожелания', 'Дата'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500, fontSize: 13, borderBottom: '1px solid #e8ddd5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fdfaf8' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#333' }}>{r.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 13,
                        background: r.attend === 'yes' ? '#d4edda' : '#f8d7da',
                        color: r.attend === 'yes' ? '#155724' : '#721c24',
                      }}>
                        {r.attend === 'yes' ? '✓ Придёт' : '✗ Не сможет'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{r.guests}</td>
                    <td style={{ padding: '12px 16px', color: '#555', maxWidth: 250 }}>{r.wishes || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
