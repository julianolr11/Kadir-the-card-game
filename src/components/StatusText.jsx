import React from 'react';
import '../styles/status-text.css';

// \b nas pontas evita casar a raiz no meio de outra palavra sem relação (ex: "cura" dentro de
// "escura"). "atordoamento" precisa vir antes de "atordoa(?:m)?" na alternância - a regex tenta
// as opções em ordem e para na primeira que casa, então a forma mais curta "ganhava" primeiro
// e cortava a palavra ao meio ("atordoam" + "ento" sobrando).
const STATUS_PATTERN = /\b(envenenamento|envenenado|envenena(?:m)?|veneno|poison(?:s|ed|ing)?|congelamento|congelado|congela(?:m)?|freeze(?:s)?|frozen|queimaduras?|queimado|queima(?:m)?|burn(?:s|ed|ing)?|paralisia|paralisado|paralisa(?:m)?|atordoado|atordoamento|atordoa(?:m)?|paraly[sz]e(?:s|d)?|stun(?:s|ned)?|derrubado|derruba(?:m)?|knock\s*down|sangramento|sangrando|sangra(?:m)?|bleed(?:s|ing)?|sono|dormindo|dorme(?:m)?|adormece(?:m)?|sleep(?:s)?|asleep|escudos?|armadura|shield(?:s)?|armor|cura(?:m)?|curando|regenera(?:ção|cao)?|regenera(?:m)?|heal(?:s|ing)?)\b/gi;
const STATUS_EXACT = new RegExp(`^(?:${STATUS_PATTERN.source})$`, 'i');

const statusClass = (word) => {
  const value = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/venen|poison/.test(value)) return 'status-word--poison';
  if (/congel|freeze|frozen/.test(value)) return 'status-word--freeze';
  if (/queim|burn/.test(value)) return 'status-word--burn';
  if (/paralis|paraly|stun|atordoa/.test(value)) return 'status-word--paralyze';
  if (/sangr|bleed/.test(value)) return 'status-word--bleed';
  if (/sono|dorm|sleep|asleep/.test(value)) return 'status-word--sleep';
  if (/escudo|armadura|shield|armor/.test(value)) return 'status-word--shield';
  return 'status-word--heal';
};

const plainText = (value) => String(value || '').replace(/<[^>]+>/g, '');

export default function StatusText({ text, className = '' }) {
  return (
    <span className={className}>
      {plainText(text).split(STATUS_PATTERN).map((part, index) => (
        STATUS_EXACT.test(part)
          ? <strong className={`status-word ${statusClass(part)}`} key={`${part}-${index}`}>{part}</strong>
          : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      ))}
    </span>
  );
}
