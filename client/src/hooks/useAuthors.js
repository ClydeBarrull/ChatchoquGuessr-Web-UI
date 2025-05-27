// client/src/hooks/useAuthors.js
import { useEffect, useState } from 'react';

export default function useAuthors() {
  const [authors, setAuthors] = useState({});
  useEffect(() => {
    fetch('/api/authors')
      .then((r) => r.json())
      .then((j) => {
        const map = {};
        j.authors.forEach((a) => (map[a.discordname] = a));
        setAuthors(map);
      });
  }, []);
  return authors;              // { blydepog: { realname, photopath … } }
}
