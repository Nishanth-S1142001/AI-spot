import NeonBackground from '../ui/background'
export default function LoadingState(
  { message = 'Loading...' },
  className = ''
) {
  return (
    <>
      <NeonBackground />
      <div
        className={`fixed inset-0 z-50 flex ${className} items-center justify-center font-mono text-neutral-100`}
      >
        <div className='text-center'>
          {/* START OF SVG SPINNER REPLACEMENT */}
          <svg
            className='mx-auto mb-4 h-12 w-12 animate-spin text-orange-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            {/* Background Ring (e.g., neutral color) */}
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            {/* Foreground Arc (e.g., brand color) */}
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          {/* END OF SVG SPINNER REPLACEMENT */}
          <p className='text-lg text-orange-400'>{message}</p>
        </div>
      </div>
    </>
  )
}
