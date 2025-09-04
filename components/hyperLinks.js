"use client"; // add this if you want to use hooks/events

export default function hyperLink({ text, onClick, className }) {
  return (
    <div
      onClick={onClick}
      className={`${className} text-sm text-neutral-400 transition-colors hover:text-white hover:cursor-pointer`}
    >
      {text}
    </div>
  );
}
