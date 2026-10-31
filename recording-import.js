/* User-selected videos stay local. Read visible words, never invent unheard audio. */
const HablaRecording = (() => {
  function isVideo(file) {
    return Boolean(file && (/^video\//i.test(file.type) || /\.(mp4|mov|m4v|webm)$/i.test(file.name || '')));
  }
  function videoFromClipboard(data) {
    for (const item of Array.from(data?.items || [])) {
      if (item.kind === 'file' && /^video\//i.test(item.type)) {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
    return Array.from(data?.files || []).find(isVideo) || null;
  }
  let openRecording = () => {};
  function bind() {
    const get = id => document.getElementById(id);
    const input = get('recording-file'), video = get('recording-preview'), review = get('recording-review');
    const status = get('recording-status'), read = get('read-recording-frame');
    if (!input || !video || !read) return;
    let objectURL = null, generation = 0, converting = false;
    const ready = () => { read.disabled = converting || video.readyState < 2 || video.seeking || !video.videoWidth; };
    function clear() {
      generation++;
      converting = false;
      video.pause(); video.removeAttribute('src'); video.load();
      if (objectURL) URL.revokeObjectURL(objectURL);
      objectURL = null; input.value = ''; review.hidden = true; read.disabled = true;
      status.textContent = '';
    }
    openRecording = file => {
      if (!isVideo(file)) { status.textContent = 'Choose a screen recording or video (.mp4, .mov, .m4v or .webm).'; return; }
      if (file.size > 500 * 1024 * 1024) { status.textContent = 'Choose a recording smaller than 500 MB, or trim it in Photos first.'; return; }
      clear();
      // A pasted recording needs the video controls outside the expanded editor.
      if (typeof HablaFullReader !== 'undefined') HablaFullReader.close();
      objectURL = URL.createObjectURL(file);
      review.hidden = false; video.src = objectURL; video.load();
      const setup = review.closest('details');
      if (setup) setup.open = true;
      status.textContent = 'Opening recording on this device…';
    };
    get('choose-recording').addEventListener('click', () => input.click());
    get('music-choose-recording')?.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      const file = input.files?.[0]; input.value = '';
      if (file) openRecording(file);
    });
    video.addEventListener('loadedmetadata', () => {
      status.textContent = 'Recording ready. Play or scrub to the words, pause, then tap Read text at this moment. Audio is not transcribed.';
      ready();
    });
    for (const event of ['loadeddata', 'seeked', 'seeking', 'canplay']) video.addEventListener(event, ready);
    video.addEventListener('error', () => {
      if (!objectURL || !video.error) return;
      read.disabled = true;
      status.textContent = 'This recording could not open. Export an MP4 from Photos, or import a screenshot of the words.';
    });
    read.addEventListener('click', () => {
      if (read.disabled || !objectURL) return;
      video.pause();
      const token = generation, seconds = video.currentTime;
      converting = true; ready();
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 2000 / Math.max(video.videoWidth, video.videoHeight));
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (token !== generation) return;
          converting = false; ready();
          if (!blob) { status.textContent = 'This frame could not be read. Try another moment.'; return; }
          HablaScreenshot.read(new File([blob], 'recording-frame.png', {type:'image/png'}));
          status.textContent = `Reading visible text at ${seconds.toFixed(1)} seconds. Review the extracted words below before translating. Open Image area to crop out controls.`;
        }, 'image/png');
      } catch {
        converting = false; ready();
        status.textContent = 'This frame could not be read. Try another moment or import a screenshot.';
      }
    });
    get('clear-recording').addEventListener('click', clear);
    const pasteHelp = 'iOS did not provide a video. Tap Recording and choose Photo Library, or save it to Files and choose it there.';
    const paste = async () => {
      if (!navigator.clipboard?.read) { status.textContent = pasteHelp; return; }
      try {
        for (const item of await navigator.clipboard.read()) {
          const type = item.types.find(type => /^video\//i.test(type));
          if (type) { openRecording(await item.getType(type)); return; }
        }
        status.textContent = pasteHelp;
      } catch { status.textContent = pasteHelp; }
    };
    get('paste-recording').addEventListener('click', paste);
    get('music-paste-recording')?.addEventListener('click', paste);
    document.addEventListener('paste', event => {
      if (!['translator-input', 'full-reader-source'].includes(event.target?.id)) return;
      const file = videoFromClipboard(event.clipboardData);
      if (file) { event.preventDefault(); openRecording(file); }
    });
    window.addEventListener('pagehide', clear);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true});
    else bind();
  }
  return {isVideo, videoFromClipboard, open:file => openRecording(file)};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = HablaRecording;
