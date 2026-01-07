import React from 'react';

export default function CombatLog({ entries = [] }) {
  return (
    <div className="combat-log">
      <div className="combat-log-title">Log</div>
      <div className="combat-log-entries">
        {entries.length === 0 && <div className="combat-log-empty">Sem eventos.</div>}
        {entries.map((e, i) => (
          <div key={i} className="combat-log-line">{e}</div>
        ))}
      </div>
    </div>
  );
}
