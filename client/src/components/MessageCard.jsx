import TenorGif from './TenorGif';

const MessageCard = ({ message, placeholder = false }) => {
  if (placeholder) {
    return <div className="bg-gray-800 h-14 rounded animate-pulse" />;
  }

  // détecte un lien https://tenor.com/view/…
  const tenorLink = message.match(/https:\/\/tenor\.com\/view\/[^\s]+/i)?.[0];
  if (tenorLink) {
    return <TenorGif url={tenorLink} />;
  }

  // rendu texte normal
  return <div className="bg-white p-4 rounded shadow">{message}</div>;
};

export default MessageCard;
