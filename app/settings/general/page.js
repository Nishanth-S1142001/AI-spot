'use client'

import {
  ArrowLeft,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  Shield,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import NavigationBar from '../../../components/navigationBar/navigationBar'
import { useAuth } from '../../../components/providers/AuthProvider'
import SideBarLayout from '../../../components/sideBarLayout'
import NeonBackground from '../../../components/ui/background'
import Button from '../../../components/ui/button'
import Card from '../../../components/ui/card'
import {
  useChangePassword,
  useUpdateNotifications,
  useUpdateProfile,
  useUploadAvatar
} from '../../../lib/hooks/useAgentData'
import { useLogout } from '../../../lib/supabase/auth'
import GeneralSettingsPageSkeleton from '../../../components/skeleton/GeneralSettingsPageSkeleton'

/**
 * FULLY OPTIMIZED General Settings Page
 *
 * React Query Integration:
 * - Automatic profile data syncing
 * - Optimistic updates for all mutations
 * - Proper error handling and rollback
 *
 * Performance:
 * - Memoized components
 * - Stable handlers
 * - Optimized rendering
 */

// Utility functions - pure, outside component
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' }

  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  if (strength <= 2) return { strength, label: 'Weak', color: 'text-red-400' }
  if (strength <= 3)
    return { strength, label: 'Fair', color: 'text-yellow-400' }
  if (strength <= 4) return { strength, label: 'Good', color: 'text-blue-400' }
  return { strength, label: 'Strong', color: 'text-green-400' }
}

/**
 * Memoized Avatar Section Component
 */
const AvatarSection = memo(({ fullName, avatarUrl, onUpload, uploading }) => {
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error('File size must be less than 2MB')
          return
        }
        onUpload(file)
      }
    },
    [onUpload]
  )

  return (
    <div>
      <label className='mb-3 block text-sm font-medium text-neutral-300'>
        Profile Picture
      </label>
      <div className='flex items-center gap-6'>
        <div className='relative'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-2xl font-bold text-white'>
            {fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <label
            htmlFor='avatar-upload'
            className='absolute right-0 bottom-0 cursor-pointer rounded-full bg-orange-600 p-2 text-white transition-colors hover:bg-orange-700'
          >
            <Camera className='h-3 w-3' />
          </label>
          <input
            id='avatar-upload'
            type='file'
            accept='image/jpeg,image/png,image/gif'
            className='hidden'
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <div>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          <p className='mt-2 text-xs text-neutral-500'>
            JPG, PNG or GIF (MAX. 2MB)
          </p>
        </div>
      </div>
    </div>
  )
})
AvatarSection.displayName = 'AvatarSection'

/**
 * Memoized Password Input Component
 */
const PasswordInput = memo(
  ({
    label,
    value,
    onChange,
    placeholder,
    showPassword,
    onToggleShow,
    icon: Icon = Lock
  }) => {
    return (
      <div>
        <label className='mb-2 block text-sm font-medium text-neutral-300'>
          {label}
        </label>
        <div className='relative'>
          <Icon className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500' />
          <input
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            className='w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pr-12 pl-10 text-neutral-100 placeholder:text-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none'
            placeholder={placeholder}
          />
          <button
            type='button'
            onClick={onToggleShow}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 hover:text-neutral-300'
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

/**
 * Memoized Notification Toggle Component
 */
const NotificationToggle = memo(({ label, description, checked, onChange }) => {
  return (
    <div className='flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:border-neutral-700'>
      <div className='flex-1'>
        <p className='font-medium text-neutral-200'>{label}</p>
        <p className='mt-1 text-sm text-neutral-400'>{description}</p>
      </div>
      <button
        type='button'
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-purple-600' : 'bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
})
NotificationToggle.displayName = 'NotificationToggle'

/**
 * Memoized Profile Information Section
 */
const ProfileInfoSection = memo(
  ({
    profileData,
    onProfileChange,
    onSubmit,
    loading,
    onAvatarUpload,
    uploading
  }) => {
    return (
      <Card className='border-orange-600/20 bg-gradient-to-br from-orange-950/10 to-neutral-950/50'>
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-3'>
            <User className='h-5 w-5 text-orange-400' />
            <h2 className='text-xl font-semibold text-neutral-100'>
              Profile Information
            </h2>
          </div>
          <p className='text-sm text-neutral-400'>
            Update your personal information and email address
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-6'>
          <AvatarSection
            fullName={profileData.full_name}
            avatarUrl={profileData.avatar_url}
            onUpload={onAvatarUpload}
            uploading={uploading}
          />

          {/* Full Name */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Full Name
            </label>
            <input
              type='text'
              value={profileData.full_name}
              onChange={(e) => onProfileChange('full_name', e.target.value)}
              className='w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-100 placeholder:text-neutral-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none'
              placeholder='Enter your full name'
            />
          </div>

          {/* Email */}
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-300'>
              Email Address
            </label>
            <div className='relative'>
              <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-neutral-500' />
              <input
                type='email'
                value={profileData.email}
                disabled
                className='w-full cursor-not-allowed rounded-lg border border-neutral-800 bg-neutral-900/50 py-2 pr-4 pl-10 text-neutral-400'
              />
            </div>
            <p className='mt-1 text-xs text-neutral-500'>
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end border-t border-neutral-800 pt-4'>
            <Button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4' />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    )
  }
)
ProfileInfoSection.displayName = 'ProfileInfoSection'

/**
 * Memoized Password Section
 */
const PasswordSection = memo(
  ({
    passwordData,
    onPasswordChange,
    showPassword,
    onTogglePassword,
    onSubmit,
    loading
  }) => {
    const passwordStrength = useMemo(
      () => getPasswordStrength(passwordData.newPassword),
      [passwordData.newPassword]
    )

    return (
      <Card className='border-blue-600/20 bg-gradient-to-br from-blue-950/10 to-neutral-950/50'>
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-3'>
            <Lock className='h-5 w-5 text-blue-400' />
            <h2 className='text-xl font-semibold text-neutral-100'>
              Password & Security
            </h2>
          </div>
          <p className='text-sm text-neutral-400'>
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={onSubmit} className='space-y-6'>
          <PasswordInput
            label='Current Password'
            value={passwordData.currentPassword}
            onChange={(e) =>
              onPasswordChange('currentPassword', e.target.value)
            }
            placeholder='Enter current password'
            showPassword={showPassword.current}
            onToggleShow={() => onTogglePassword('current')}
          />

          <PasswordInput
            label='New Password'
            value={passwordData.newPassword}
            onChange={(e) => onPasswordChange('newPassword', e.target.value)}
            placeholder='Enter new password'
            showPassword={showPassword.new}
            onToggleShow={() => onTogglePassword('new')}
          />

          {passwordData.newPassword && (
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-neutral-400'>Strength:</span>
              <span className={`font-medium ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
              <div className='ml-2 h-2 flex-1 overflow-hidden rounded-full bg-neutral-800'>
                <div
                  className={`h-full transition-all ${
                    passwordStrength.strength <= 2
                      ? 'bg-red-500'
                      : passwordStrength.strength <= 3
                        ? 'bg-yellow-500'
                        : passwordStrength.strength <= 4
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <PasswordInput
            label='Confirm New Password'
            value={passwordData.confirmPassword}
            onChange={(e) =>
              onPasswordChange('confirmPassword', e.target.value)
            }
            placeholder='Confirm new password'
            showPassword={showPassword.confirm}
            onToggleShow={() => onTogglePassword('confirm')}
          />

          {/* Password Requirements */}
          <div className='rounded-lg border border-blue-600/20 bg-blue-900/10 p-4'>
            <p className='mb-2 text-sm font-medium text-blue-300'>
              Password Requirements:
            </p>
            <ul className='space-y-1 text-sm text-neutral-400'>
              <li className='flex items-center gap-2'>
                <div className='h-1 w-1 rounded-full bg-neutral-500' />
                At least 8 characters long
              </li>
              <li className='flex items-center gap-2'>
                <div className='h-1 w-1 rounded-full bg-neutral-500' />
                Include at least one uppercase letter
              </li>
              <li className='flex items-center gap-2'>
                <div className='h-1 w-1 rounded-full bg-neutral-500' />
                Include at least one number
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end border-t border-neutral-800 pt-4'>
            <Button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700'
            >
              {loading ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent' />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className='h-4 w-4' />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    )
  }
)
PasswordSection.displayName = 'PasswordSection'

/**
 * Memoized Notifications Section
 */
const NotificationsSection = memo(
  ({ notifications, onToggle, onSave, loading }) => {
    const notificationItems = useMemo(
      () => [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive email notifications for important updates'
        },
        {
          key: 'agentAlerts',
          label: 'Agent Alerts',
          description: 'Get notified when your agents need attention'
        },
        {
          key: 'workflowAlerts',
          label: 'Workflow Alerts',
          description: 'Receive alerts for workflow executions and failures'
        },
        {
          key: 'weeklyReport',
          label: 'Weekly Report',
          description: 'Get a weekly summary of your agent performance'
        },
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          description: 'Receive product updates and promotional emails'
        }
      ],
      []
    )

    return (
      <Card className='border-purple-600/20 bg-gradient-to-br from-purple-950/10 to-neutral-950/50'>
        <div className='mb-6'>
          <div className='mb-2 flex items-center gap-3'>
            <Bell className='h-5 w-5 text-purple-400' />
            <h2 className='text-xl font-semibold text-neutral-100'>
              Notification Preferences
            </h2>
          </div>
          <p className='text-sm text-neutral-400'>
            Choose how you want to receive notifications
          </p>
        </div>

        <div className='space-y-4'>
          {notificationItems.map((item) => (
            <NotificationToggle
              key={item.key}
              label={item.label}
              description={item.description}
              checked={notifications[item.key]}
              onChange={() => onToggle(item.key)}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className='mt-6 flex justify-end border-t border-neutral-800 pt-6'>
          <Button
            onClick={onSave}
            disabled={loading}
            className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700'
          >
            {loading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent' />
                Saving...
              </>
            ) : (
              <>
                <Save className='h-4 w-4' />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </Card>
    )
  }
)
NotificationsSection.displayName = 'NotificationsSection'

/**
 * Memoized Header Section
 */
const HeaderSection = memo(() => {
  return (
    <>
      <Link
        href='/settings'
        className='mb-6 inline-flex items-center gap-2 text-orange-500 transition-colors hover:text-orange-400'
      >
        <ArrowLeft className='h-4 w-4' />
        Back to Settings
      </Link>

      <div className='mb-8'>
        <div className='mb-2 flex items-center gap-3'>
          <User className='h-8 w-8 text-orange-500' />
          <h1 className='text-3xl font-bold text-neutral-100'>
            General Settings
          </h1>
        </div>
        <p className='text-neutral-400'>
          Manage your profile information, security, and preferences
        </p>
      </div>
    </>
  )
})
HeaderSection.displayName = 'HeaderSection'

/**
 * Main General Settings Page Component
 */
export default function GeneralSettingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { logout } = useLogout()

  // Local state
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    agentAlerts: true,
    workflowAlerts: true,
    weeklyReport: false,
    marketingEmails: false
  })
  const userProfile = {
    name: profile?.full_name || user?.email?.split('@')[0] || 'Guest',
    email: user?.email || 'guest@example.com',
    avatar: profile?.avatar_url || null
  }

  // React Query mutations - MUST be called before any conditional returns
  const { mutate: updateProfile, isPending: profileLoading } =
    useUpdateProfile()
  const { mutate: changePassword, isPending: passwordLoading } =
    useChangePassword()
  const { mutate: updateNotificationPrefs, isPending: notificationLoading } =
    useUpdateNotifications()
  const { mutate: uploadAvatar, isPending: avatarUploading } = useUploadAvatar()

  // Initialize profile data from context
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || user?.email || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile, user])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  // Stable handlers - MUST be declared before conditional returns
  const handleProfileChange = useCallback((field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handlePasswordChange = useCallback((field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTogglePassword = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }, [])

  const handleNotificationToggle = useCallback((key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleProfileSubmit = useCallback(
    (e) => {
      e.preventDefault()

      updateProfile(
        { userId: user.id, profileData },
        {
          onSuccess: async () => {
            await refreshProfile()
          }
        }
      )
    },
    [user?.id, profileData, updateProfile, refreshProfile]
  )

  const handlePasswordSubmit = useCallback(
    (e) => {
      e.preventDefault()

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }

      if (passwordData.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }

      changePassword(
        {
          userId: user.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          onSuccess: () => {
            setPasswordData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: ''
            })
          }
        }
      )
    },
    [user?.id, passwordData, changePassword]
  )

  const handleNotificationSave = useCallback(() => {
    updateNotificationPrefs({
      userId: user.id,
      notifications
    })
  }, [user?.id, notifications, updateNotificationPrefs])

  const handleAvatarUpload = useCallback(
    (file) => {
      uploadAvatar(
        { userId: user.id, file },
        {
          onSuccess: async () => {
            await refreshProfile()
          }
        }
      )
    },
    [user?.id, uploadAvatar, refreshProfile]
  )

  // NOW we can do conditional logic - after all hooks are called
  // Loading state

  const [delayedLoading, setDelayedLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setDelayedLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  if (delayedLoading || authLoading) {
    return <GeneralSettingsPageSkeleton userProfile={userProfile} />
  }

  if (!user) {
    return null
  }

  return (
    <>
      <NeonBackground />
      <SideBarLayout userProfile={userProfile}>
        <div className='flex h-screen w-full flex-col bg-neutral-900/10 font-mono text-neutral-100 backdrop-blur-sm'>
          {/* Header */}
          <div className='sticky top-0 z-20 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-xl'>
            <NavigationBar
              profile={profile}
              title='General Settings'
              onLogOutClick={logout}
            />
          </div>

          {/* Main Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
              <HeaderSection />

              <div className='space-y-8'>
                <ProfileInfoSection
                  profileData={profileData}
                  onProfileChange={handleProfileChange}
                  onSubmit={handleProfileSubmit}
                  loading={profileLoading}
                  onAvatarUpload={handleAvatarUpload}
                  uploading={avatarUploading}
                />

                <PasswordSection
                  passwordData={passwordData}
                  onPasswordChange={handlePasswordChange}
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                  onSubmit={handlePasswordSubmit}
                  loading={passwordLoading}
                />

                <NotificationsSection
                  notifications={notifications}
                  onToggle={handleNotificationToggle}
                  onSave={handleNotificationSave}
                  loading={notificationLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </SideBarLayout>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(23, 23, 23, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </>
  )
}
