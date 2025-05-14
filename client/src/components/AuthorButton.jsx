// AuthorButton.jsx
const AuthorButton = ({ author, onClick, disabled, highlight }) => {
  // Pick colour: green ✔️, red ❌, or neutral indigo
  const colour =
    highlight === true
      ? 'bg-green-600'
      : highlight === false
      ? 'bg-red-600'
      : 'bg-indigo-600';

  return (
    <button
      className={`${colour} text-white px-3 py-2 rounded disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
    >
      {author}
    </button>
  );
};

export default AuthorButton;
