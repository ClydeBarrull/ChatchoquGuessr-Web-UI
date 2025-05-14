import { useEffect, useRef } from 'react';

// en haut du fichier ou dans un util
const loaded = new Set();
function ScriptOnce({ src }) {
  useEffect(() => {
    if (loaded.has(src)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
    loaded.add(src);
  }, [src]);
  return null;
}

const TenorGif = ({ url }) => {
  const ref = useRef(null);

  // ----- 1. extrait l’ID (postid) ----------------------------
  // ex : https://tenor.com/view/foo-bar-25591052  → 25591052
  const slug = url.split('/').pop();                    // foo-bar-25591052
  const postid = slug.split('-').pop();                 // 25591052

  // ----- 2. charge le script embed.js une seule fois ----------
  useEffect(() => {
    if (!window.__tenorEmbedScriptAdded) {
      const script = document.createElement('script');
      script.src = 'https://tenor.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      window.__tenorEmbedScriptAdded = true;
    } else if (window.__TAPI__?.reload) {
      // si le script est déjà présent, on force Tenor à rescanner
      window.__TAPI__.reload();
    }
  }, []);

  // ----- 3. balise que le script transformera en GIF ----------
  return (
    <div className="tenor-wrapper">
        <div
        ref={ref}
        className="tenor-gif-embed"
        data-postid={postid}
        data-share-method="host"
        data-aspect-ratio="1.3"
        data-width="100%"
        />
        <ScriptOnce src="https://tenor.com/embed.js" />
    </div>
  );
};

export default TenorGif;
