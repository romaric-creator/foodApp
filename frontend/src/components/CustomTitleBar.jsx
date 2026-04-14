import React from 'react';

const barStyle = {
  WebkitAppRegion: 'drag',
  height: 32,
  background: '#222',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  userSelect: 'none',
};
const btnStyle = {
  WebkitAppRegion: 'no-drag',
  width: 36,
  height: 24,
  marginLeft: 6,
  border: 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 18,
  cursor: 'pointer',
  outline: 'none',
};

export default function CustomTitleBar() {
  const handleAction = (action) => {
    if (window.electronAPI) {
      window.electronAPI.windowAction(action);
    }
  };
  return (
    <div style={barStyle}>
      <div style={{fontWeight: 'bold'}}>RestoApp</div>
      <div>
        <button style={btnStyle} title="Minimiser" onClick={() => handleAction('minimize')}>–</button>
        <button style={btnStyle} title="Agrandir/Réduire" onClick={() => handleAction('maximize')}>☐</button>
        <button style={{...btnStyle, color: '#f55'}} title="Fermer" onClick={() => handleAction('close')}>×</button>
      </div>
    </div>
  );
}
