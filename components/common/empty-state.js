'use client'

import { Bot, FileX, Inbox, MessageSquare } from 'lucide-react'

const ICON_VARIANTS = {
  inbox: Inbox,
  bot: Bot,
  messages: MessageSquare,
  file: FileX
}

export default function EmptyState({
  title = 'No data available',
  message = 'Try adjusting your filters or add new content.',
  icon = 'inbox',
  action = null,
  variant = 'default' // 'default' | 'orange' | 'blue' | 'green' | 'purple'
}) {
  const IconComponent = ICON_VARIANTS[icon] || Inbox

  // Variant styles mapping
  const variantStyles = {
    default: {
      bg: 'from-neutral-900/40 to-neutral-950/20',
      border: 'border-neutral-700/50',
      iconBg: 'bg-neutral-800',
      iconColor: 'text-neutral-400',
      titleColor: 'text-neutral-200'
    },
    orange: {
      bg: 'from-orange-950/10 to-neutral-950/50',
      border: 'border-orange-600/20',
      iconBg: 'bg-orange-900/40',
      iconColor: 'text-orange-400',
      titleColor: 'text-neutral-200'
    },
    blue: {
      bg: 'from-blue-950/10 to-neutral-950/50',
      border: 'border-blue-600/20',
      iconBg: 'bg-blue-900/40',
      iconColor: 'text-blue-400',
      titleColor: 'text-neutral-200'
    },
    green: {
      bg: 'from-green-950/10 to-neutral-950/50',
      border: 'border-green-600/20',
      iconBg: 'bg-green-900/40',
      iconColor: 'text-green-400',
      titleColor: 'text-neutral-200'
    },
    purple: {
      bg: 'from-purple-950/10 to-neutral-950/50',
      border: 'border-purple-600/20',
      iconBg: 'bg-purple-900/40',
      iconColor: 'text-purple-400',
      titleColor: 'text-neutral-200'
    }
  }

  const styles = variantStyles[variant] || variantStyles.default

  return (
    <div
      className={`rounded-lg border bg-gradient-to-br font-mono ${styles.border} ${styles.bg}`}
    >
      <div className="flex flex-col items-center py-12 text-center">
        {/* Icon */}
        <div
          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg} transition-transform hover:scale-110`}
        >
          <IconComponent className={`h-8 w-8 ${styles.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className={`mb-2 text-lg font-semibold ${styles.titleColor}`}>
          {title}
        </h3>

        {/* Message */}
        <p className="max-w-sm text-sm text-neutral-400">{message}</p>

        {/* Optional Action Button */}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  )
}