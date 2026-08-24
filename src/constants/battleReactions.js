import reactionSurprised from '../assets/img/icons/reactions/reaction-surprised.png';
import reactionLaughing from '../assets/img/icons/reactions/reaction-laughing.png';
import reactionCrowned from '../assets/img/icons/reactions/reaction-crowned.png';
import reactionKnockedOut from '../assets/img/icons/reactions/reaction-knocked-out.png';
import reactionSad from '../assets/img/icons/reactions/reaction-sad.png';
import reactionLove from '../assets/img/icons/reactions/reaction-love.png';
import reactionWink from '../assets/img/icons/reactions/reaction-wink.png';

// Registro central e imutável das reações de batalha. IDs curtos, estáveis e nunca vindos da
// rede como caminho de imagem - a mensagem P2P carrega só o `id`, o remetente resolve o ícone
// localmente contra este registro (ver isValidBattleReactionId).
export const BATTLE_REACTIONS = Object.freeze([
  Object.freeze({ id: 'surprised', icon: reactionSurprised, label: { pt: 'Surpreso', en: 'Surprised' } }),
  Object.freeze({ id: 'laughing', icon: reactionLaughing, label: { pt: 'Rindo', en: 'Laughing' } }),
  Object.freeze({ id: 'crowned', icon: reactionCrowned, label: { pt: 'Coroado', en: 'Crowned' } }),
  Object.freeze({ id: 'knocked-out', icon: reactionKnockedOut, label: { pt: 'Nocauteado', en: 'Knocked out' } }),
  Object.freeze({ id: 'sad', icon: reactionSad, label: { pt: 'Triste', en: 'Sad' } }),
  Object.freeze({ id: 'love', icon: reactionLove, label: { pt: 'Amei', en: 'Love' } }),
  Object.freeze({ id: 'wink', icon: reactionWink, label: { pt: 'Piscadela', en: 'Wink' } }),
]);

export const BATTLE_REACTIONS_BY_ID = Object.freeze(
  Object.fromEntries(BATTLE_REACTIONS.map((reaction) => [reaction.id, reaction])),
);

export function isValidBattleReactionId(reactionId) {
  return typeof reactionId === 'string' && Object.prototype.hasOwnProperty.call(BATTLE_REACTIONS_BY_ID, reactionId);
}

export const BATTLE_REACTION_SEND_COOLDOWN_MS = 1500;
export const BATTLE_REACTION_RECEIVE_MIN_INTERVAL_MS = 750;
export const BATTLE_REACTION_DISPLAY_MS = 2500;
