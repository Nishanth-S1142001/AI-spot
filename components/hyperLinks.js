"use client"; // add this if you want to use hooks/events

export default function Button({ text, onClick }) {
  return (
    <div
      onClick={onClick}
      className="text-sm text-blue-400 transition-colors hover:text-blue-500 hover:cursor-pointer"
    >
      {text}
    </div>
  );
}
