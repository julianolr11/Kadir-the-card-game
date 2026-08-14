import React from 'react';
import '../styles/status-text.css';

const STATUS_PATTERN = /(envenenamento|envenenado|envenena|veneno|poison(?:ed|ing)?|congelamento|congelado|congela|freeze|frozen|queimaduras?|queimado|queima|burn(?:ed|ing)?|paralisia|paralisado|paralisa|atordoado|atordoa|paraly[sz]e(?:d)?|stun(?:ned)?|sangramento|sangrando|sangra|bleed(?:ing)?|sono|dormindo|dorme|adormece|sleep|asleep|escudos?|armadura|shield(?:s)?|armor|cura|curando|regenera(?:ção|cao)?|regenera|heal(?:ing)?)/gi;
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
