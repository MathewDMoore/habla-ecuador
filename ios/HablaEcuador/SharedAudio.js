// Bundled native bridge: bounded chunks avoid a giant base64 JavaScript call.
(function () {
  'use strict';
  if (location.origin !== 'https://mathewdmoore.github.io' || !location.pathname.startsWith('/habla-ecuador/')) return;
  let incoming = null;
  window.__hablaSharedAudio = message => {
    if (message.action === 'begin') {
      if (!window.HablaWhatsAppAudio?.open) return false;
      incoming = {id: message.id, name: message.name, type: message.type, parts: [], size: 0};
    } else if (message.action === 'chunk') {
      if (!incoming || incoming.id !== message.id) return false;
      const raw = atob(message.data), bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
      incoming.size += bytes.length;
      if (incoming.size > 50 * 1024 * 1024) { incoming = null; return false; }
      incoming.parts.push(bytes);
    } else if (message.action === 'end') {
      if (!incoming || incoming.id !== message.id) return false;
      const note = incoming;
      incoming = null;
      return window.HablaWhatsAppAudio.open(new File(note.parts, note.name, {type: note.type}));
    } else { incoming = null; return false; }
    return true;
  };
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('whatsapp-audio-import');
    if (!container) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Audios compartidos / Shared voice notes';
    button.addEventListener('click', () => window.webkit.messageHandlers.hablaAudio.postMessage({action: 'inbox'}));
    container.append(button);
  });
})();
