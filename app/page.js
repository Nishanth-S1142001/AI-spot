'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { lazy, Suspense, useCallback, useReducer } from 'react'

// Static imports for critical components
import NavigationBar from '../components/navigationBar/navigationBar.js'
import NeonBackground from '../components/ui/background'

// Dynamic imports for non-critical components
const BottomModal = dynamic(() => import('../components/ui/modal'), {
  ssr: false
})
// Lazy load all sections for code splitting
const AuthForms = lazy(() => import('./AuthForms'))
const HeroSection = lazy(() => import('./HeroSection'))
const AgentBuilderSection = lazy(() => import('./AgentBuilderSection'))
const CommunitySection = lazy(() => import('./CommunitySection'))
const FeaturesSection = lazy(() => import('./FeaturesSection'))
const TestimonialsSection = lazy(() => import('./TestimonialsSection'))
const PricingSection = lazy(() => import('./PricingSection'))
const StatSection = lazy(() => import('./StatsSection'))
const FooterSection = lazy(() => import('./FooterSection'))

// Consolidated state reducer for passwordless auth
const initialState = {
  isSidebarOpen: false,
  isOpen: false,
  modalView: 'email', // 'email' or 'verify'
  isLoading: false,
  auth: {
    email: '',
    otp: ''
  },
  errors: {},
  successMessage: ''
}

export function authReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen }

    case 'OPEN_MODAL':
      return {
        ...state,
        isOpen: true,
        modalView: 'email',
        errors: {},
        successMessage: '',
        auth: { email: '', otp: '' }
      }

    case 'CLOSE_MODAL':
      return {
        ...state,
        isOpen: false,
        modalView: 'email',
        errors: {},
        successMessage: '',
        auth: { email: '', otp: '' }
      }

    case 'SET_VIEW':
      return { ...state, modalView: action.view }

    case 'SET_LOADING':
      return { ...state, isLoading: action.value }

    case 'UPDATE_FIELD':
      return {
        ...state,
        auth: { ...state.auth, [action.field]: action.value }
      }

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message }
      }

    case 'CLEAR_ERRORS':
      return { ...state, errors: {}, successMessage: '' }

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

  const handleOpenModal = useCallback(() => {
    dispatch({ type: 'OPEN_MODAL' })
  }, [])

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' })
  }, [])

  // Get modal title based on view
  const getModalTitle = () => {
    switch (state.modalView) {
      case 'email':
        return 'Welcome to AI Agency'
      case 'verify':
        return 'Verify Your Email'
      default:
        return 'Authentication'
    }
  }

  return (
    <div className='relative min-h-screen font-mono'>
      {/* Fixed Background */}
      <NeonBackground />

      {/* Main Content */}
      <div className='relative z-10'>
        {/* Navigation Bar */}
        <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
          <NavigationBar onLoginClick={handleOpenModal} title='AI Agency' />
        </div>

        {/* Page Sections */}
        <Suspense fallback={<PageLoadingSkeleton />}>
          {/* Hero Section with Glow Effect */}
          <div id='home' className='relative'>
            {/* Central Glow */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
              <div className='h-[800px] w-[800px] rounded-full bg-orange-500/20 blur-[150px]' />
            </div>

            <div id='builder'>
              <AgentBuilderSection  onLoginClick={handleOpenModal}/>
            </div>
            <HeroSection onGetStarted={handleOpenModal} />
          </div>

          <div id='community'>
            <CommunitySection />
          </div>

          <div id='services'>
            <FeaturesSection />
          </div>

          <div id='testimonials'>
            <TestimonialsSection />
          </div>
          <div id='stats'>
            <StatSection />
          </div>

          <div id='pricing'>
            <PricingSection onSelectPlan={handleOpenModal} />
          </div>

          <div>
            <FooterSection />
          </div>
        </Suspense>

        {/* Authentication Modal - Bottom Modal */}
        <BottomModal
          isOpen={state.isOpen}
          onClose={handleCloseModal}
          title={getModalTitle()}
          closeOnBackdrop={true}
          closeOnEsc={true}
          size='md'
          showCloseButton={true}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <AuthForms
              state={state}
              dispatch={dispatch}
              onClose={handleCloseModal}
              router={router}
            />
          </Suspense>
        </BottomModal>
      </div>

      {/* Global Smooth Scroll Style */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        /* Offset for sticky navbar */
        #home,
        #builder,
        #about,
        #services,
        #testimonials,
        #pricing {
          scroll-margin-top: 5rem;
        }
      `}</style>
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
