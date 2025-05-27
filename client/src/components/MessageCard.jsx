import { useEffect, useState } from 'react';

const bubble = 'text-white rounded-lg px-10';

export default function MessageCard({ message, placeholder = false }) {
  /* barre cachée */
  if (placeholder) {
    return <div className={`${bubble} h-6 animate-pulse bg-stone-900`} />;
  }

  /* ─────────── TENOR LINK DETECTION ─────────── */
  const match = message.match(/https:\/\/tenor\.com\/view\/[^\s]+/i);
  const [gifUrl, setGifUrl] = useState(null);

  useEffect(() => {
    let abort = false;
    if (!match) return;

    /* 1. extraire l’ID (dernier segment après le dernier tiret) */
    const id = match[0].split('-').pop();          // « 20219971 »

    /* 2. appeler l’API officielle (clé demo) */
    fetch(`https://g.tenor.com/v1/gifs?ids=${id}&key=LIVDSRZULELA`)
      .then((r) => r.json())
      .then((json) => {
        if (abort) return;

        /* 3. choisir le format : tinygif si dispo, sinon gif “normal” */
        const media = json?.results?.[0]?.media?.[0];
        const url =
          media?.tinygif?.url ||
          media?.gif?.url ||
          json?.results?.[0]?.url; // secours absolu

        if (url) setGifUrl(url);
      })
      .catch(() => {/* laisse le texte brut si erreur */});

    return () => {
      abort = true;
    };
  }, [match]);

  /* ─────────── RENDU ─────────── */
  if (gifUrl) {
    return (
      <div className={bubble}>
        <img
          src={gifUrl}
          alt="GIF Tenor"
          className="w-full max-h-80 object-contain rounded-lg"
        />
      </div>
    );
  }

  return <div className={bubble}>{message}</div>;
}
