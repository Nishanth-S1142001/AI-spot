'use client'

import { memo } from 'react'
import { Twitter, Linkedin, Github, Mail, MapPin, Phone } from 'lucide-react'
import Button from '../components/ui/button'
const FooterSection = memo(() => {
  const currentYear = new Date().getFullYear()

  return (
    <footer id='contact' className='relative bg-neutral-900 px-4 py-12 text-neutral-400'>
      <div className='mx-auto max-w-7xl'>
        {/* Main Footer Content */}
        <div className='grid gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12'>
          {/* Company Info */}
          <div>
            <h3 className='mb-4 text-xl font-bold text-neutral-100'>
              AI Agents Inc.
            </h3>
            <p className='mb-4 text-sm leading-relaxed'>
              Empowering businesses with no-code AI solutions. Build intelligent agents without technical barriers.
            </p>
            <div className='flex gap-4'>
              <SocialLink href='#' icon={Twitter} label='Twitter' />
              <SocialLink href='#' icon={Linkedin} label='LinkedIn' />
              <SocialLink href='#' icon={Github} label='GitHub' />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
              Quick Links
            </h4>
            <ul className='space-y-2 text-sm'>
              <FooterLink href='#about'>About Us</FooterLink>
              <FooterLink href='#services'>Services</FooterLink>
              <FooterLink href='#pricing'>Pricing</FooterLink>
              <FooterLink href='#testimonials'>Testimonials</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
              Resources
            </h4>
            <ul className='space-y-2 text-sm'>
              <FooterLink href='#'>Documentation</FooterLink>
              <FooterLink href='#'>API Reference</FooterLink>
              <FooterLink href='#'>Tutorials</FooterLink>
              <FooterLink href='#'>Blog</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className='mb-4 text-lg font-semibold text-neutral-100'>
              Get In Touch
            </h4>
            <ul className='space-y-3 text-sm'>
              <li className='flex items-start gap-2'>
                <Mail className='h-5 w-5 flex-shrink-0 text-orange-400' />
                <a href='mailto:contact@aiagentsinc.com' className='transition-colors hover:text-orange-400'>
                  contact@aiagentsinc.com
                </a>
              </li>
              <li className='flex items-start gap-2'>
                <Phone className='h-5 w-5 flex-shrink-0 text-orange-400' />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className='flex items-start gap-2'>
                <MapPin className='h-5 w-5 flex-shrink-0 text-orange-400' />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-neutral-800 pt-8'>
          {/* Bottom Bar */}
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <p className='text-sm'>
              &copy; {currentYear} AI Agents Inc. All Rights Reserved.
            </p>
            <div className='flex gap-6 text-sm'>
              <a href='#' className='transition-colors hover:text-orange-400'>
                Privacy Policy
              </a>
              <a href='#' className='transition-colors hover:text-orange-400'>
                Terms of Service
              </a>
              <a href='#' className='transition-colors hover:text-orange-400'>
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className='absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 to-transparent opacity-50' />
    </footer>
  )
})

FooterSection.displayName = 'FooterSection'

// Social Link Component
const SocialLink = memo(({ href, icon: Icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className='flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/50 text-neutral-400 transition-all hover:border-orange-600/50 hover:bg-neutral-800 hover:text-orange-400'
  >
    <Icon className='h-5 w-5' />
  </a>
))

SocialLink.displayName = 'SocialLink'

// Footer Link Component
const FooterLink = memo(({ href, children }) => (
  <li>
    <a
      href={href}
      className='transition-colors hover:text-orange-400'
    >
      {children}
    </a>
  </li>
))

FooterLink.displayName = 'FooterLink'

export default FooterSection
