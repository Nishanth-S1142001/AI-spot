'use client'

import { useCallback, useReducer, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Static imports for critical components
import NeonBackground from '../components/ui/background'
import NavigationBar from '../components/navigationBar/navigationBar.js'

// Dynamic imports for non-critical components
const Modal = dynamic(() => import('../components/ui/modal'), { ssr: false })
const HomeSidebar = dynamic(() => import('../components/homeSidebar'), {
  ssr: false
})

// Lazy load all sections for code splitting
const AuthForms = lazy(() => import('./AuthForms'))
const HeroSection = lazy(() => import('./HeroSection'))
const AboutSection = lazy(() => import('./AboutSection'))
const FeaturesSection = lazy(() => import('./FeaturesSection'))
const StatsSection = lazy(() => import('./StatsSection'))
const TestimonialsSection = lazy(() => import('./TestimonialsSection'))
const PricingSection = lazy(() => import('./PricingSection'))
const FooterSection = lazy(() => import('./FooterSection'))

// Consolidated state reducer
const initialState = {
  isSidebarOpen: false,
  isOpen: false,
  modalView: 'login',
  isLoading: false,
  login: { email: '', password: '', showPassword: false },
  register: {
    fullName: '',
    email: '',
    password: '',
    cpassword: '',
    showPassword: false,
    showCPassword: false,
    agreeToTerms: false,
    agreeToSMS: false
  },
  reset: { email: '' },
  errors: {},
  successMessage: ''
}

function authReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen }
    case 'OPEN_MODAL':
      return {
        ...state,
        isOpen: true,
        modalView: action.view,
        errors: {},
        successMessage: ''
      }
    case 'CLOSE_MODAL':
      return { ...state, isOpen: false, errors: {}, successMessage: '' }
    case 'SET_LOADING':
      return { ...state, isLoading: action.value }
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.form]: { ...state[action.form], [action.field]: action.value }
      }
    case 'TOGGLE_PASSWORD':
      return {
        ...state,
        [action.form]: {
          ...state[action.form],
          [action.field]: !state[action.form][action.field]
        }
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message }
      }
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} }
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.message, errors: {} }
    case 'RESET_FORM':
      return {
        ...initialState,
        isSidebarOpen: state.isSidebarOpen,
        isOpen: state.isOpen
      }
    default:
      return state
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  // Memoized callbacks
  const handleToggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }, [])

  const handleOpenModal = useCallback((view) => {
    dispatch({ type: 'OPEN_MODAL', view })
  }, [])

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  return (
    <div className='relative min-h-screen font-mono'>
      {/* Fixed Background */}
      <NeonBackground />

      {/* Main Content */}
      <div className='relative z-10'>
        {/* Navigation Bar */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar
            onLoginClick={() => handleOpenModal('login')}
            title='AI Agency'
          />
        </div>
        ={/* Page Sections */}
        <Suspense fallback={<PageLoadingSkeleton />}>
          {/* Hero Section with Glow Effect */}
          <div className='relative'>
            {/* Central Glow */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='h-[800px] w-[800px] rounded-full bg-orange-500/20 blur-[150px]' />
            </div>

            <HeroSection onGetStarted={() => handleOpenModal('register')} />
          </div>

          <AboutSection />
          <StatsSection />
          <FeaturesSection />
          <TestimonialsSection />
          <PricingSection onSelectPlan={() => handleOpenModal('register')} />
          <FooterSection />
        </Suspense>
        {/* Authentication Modal */}
        {state.isOpen && (
          <Modal isOpen={state.isOpen} onClose={handleCloseModal}>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthForms
                state={state}
                dispatch={dispatch}
                onClose={handleCloseModal}
                router={router}
              />
            </Suspense>
          </Modal>
        )}
      </div>
    </div>
  )
}

// Loading Components
function LoadingSpinner() {
  return (
    <div className='flex h-64 items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500' />
    </div>
  )
}

function PageLoadingSkeleton() {
  return (
    <div className='animate-pulse space-y-8 p-8'>
      <div className='h-96 rounded-lg bg-neutral-800/50' />
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div key={i} className='h-64 rounded-lg bg-neutral-800/50' />
        ))}
      </div>
    </div>
  )
}
