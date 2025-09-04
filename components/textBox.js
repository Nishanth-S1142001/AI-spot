'use client'

/**
 * A reusable text area component with a themed style and scrollbar.
 * It matches the visual theme of the FormInput component.
 *
 * @param {object} props - The component props.
 * @param {string} props.id - The HTML id for the textarea.
 * @param {string} props.placeholder - The placeholder text for the textarea.
 * @param {string} props.name - The name attribute for the textarea.
 * @param {string} props.value - The current value of the textarea.
 * @param {string} [props.className] - Additional classes to apply to the textarea.
 * @param {function} props.onChange - The change event handler for the textarea.
 * @param {boolean} [props.disabled=false] - Whether the textarea is disabled.
 * @param {boolean} [props.required=false] - Whether the textarea is a required field.
 * @param {number} [props.rows=5] - The number of rows to display in the textarea.
 * @param {React.ReactNode} [props.children] - Child elements to render inside the textarea.
 */
export default function FormTextarea({
  id,
  placeholder,
  name,
  value,
  className,
  onChange,
  disabled = false,
  required = false,
  rows = 5,
  children
}) {
  return (
    <>
      {/* Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          border: 2px solid transparent;
        }

        /* Firefox support */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
      <textarea
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        id={id}
        rows={rows}
        className={`${className} place-content-center custom-scrollbar resize-y overflow-y-auto border-2 border-transparent border-b-neutral-700 px-4 py-3 pl-10 text-white placeholder-neutral-400 transition-all duration-300 focus:border-b-white focus:ring-2 focus:ring-transparent focus:outline-none`}
      >
        {children}
      </textarea>
    </>
  )
}
