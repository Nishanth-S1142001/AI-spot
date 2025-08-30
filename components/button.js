"use client"; // add this if you want to use hooks/events

export default function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 rounded-xl  bg-blue-400  py-3 text-lg font-bold tracking-wide text-white transition hover:cursor-pointer hover:bg-gray-200 hover:text-black disabled:opacity-50 hover:shadow-lg hover:shadow-blue-400"
    >
      {text}
    </button>
  );
}
