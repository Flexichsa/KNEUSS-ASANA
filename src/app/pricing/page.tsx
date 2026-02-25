'use client'

import { useState } from 'react'
import { Check, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Personal',
    price: { monthly: 0, annual: 0 },
    description: 'For individuals getting started with project management',
    cta: 'Current Plan',
    ctaStyle: 'asana-btn-secondary',
    highlighted: false,
    features: [
      'Unlimited tasks',
      'Up to 10 team members',
      'List view',
      'Board view',
      'Calendar view',
      'Basic search',
      'Mobile app',
    ],
  },
  {
    name: 'Starter',
    price: { monthly: 10.99, annual: 8.99 },
    description: 'For small teams that need to manage work and scale collaboration',
    cta: 'Upgrade',
    ctaStyle: 'asana-btn-primary',
    highlighted: true,
    features: [
      'Everything in Personal, plus:',
      'Timeline view',
      'Dashboards',
      'Advanced search & reporting',
      'Unlimited team members',
      'Custom fields',
      'Task dependencies',
      'Start dates',
    ],
  },
  {
    name: 'Advanced',
    price: { monthly: 24.99, annual: 19.99 },
    description: 'For teams that need to manage a portfolio of work and report on progress',
    cta: 'Upgrade',
    ctaStyle: 'asana-btn-primary',
    highlighted: false,
    features: [
      'Everything in Starter, plus:',
      'Portfolios',
      'Goals',
      'Custom rules builder',
      'Approvals',
      'Proofing',
      'Forms branching & customization',
      'Advanced integrations',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'For organizations that need additional security, support, and control',
    cta: 'Contact Sales',
    ctaStyle: 'asana-btn-secondary',
    highlighted: false,
    features: [
      'Everything in Advanced, plus:',
      'SAML & SSO',
      'Data export',
      'Custom branding',
      'Priority support',
      'Advanced admin controls',
      'Service accounts',
      'Audit log API',
    ],
  },
]

const comparisonFeatures = [
  { name: 'Unlimited tasks', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Team members', personal: 'Up to 10', starter: 'Unlimited', advanced: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'List view', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Board view', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Calendar view', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Timeline view', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Dashboards', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Custom fields', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Task dependencies', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Portfolios', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Goals', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Custom rules', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Approvals', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'SAML & SSO', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Data export', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Custom branding', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Priority support', personal: false, starter: false, advanced: false, enterprise: true },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-asana-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 text-asana-text-secondary hover:text-asana-text-primary">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Asana</span>
          </Link>
          <Link href="/home" className="text-xl font-semibold text-asana-coral">
            asana
          </Link>
          <div className="w-24" />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-semibold text-asana-text-primary mb-3">
          Choose the right plan for your team
        </h1>
        <p className="text-asana-text-secondary max-w-lg mx-auto">
          Whether you&apos;re a team of 2 or 2,000, Asana&apos;s flexible pricing lets you pick the plan that fits your needs.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${!isAnnual ? 'text-asana-text-primary font-medium' : 'text-asana-text-secondary'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isAnnual ? 'bg-asana-coral' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isAnnual ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-sm ${isAnnual ? 'text-asana-text-primary font-medium' : 'text-asana-text-secondary'}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Save up to 18%
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-asana-coral shadow-lg ring-1 ring-asana-coral relative'
                  : 'border-asana-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-asana-coral text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-asana-text-primary">{plan.name}</h3>
              <div className="mt-3 mb-1">
                {plan.price.monthly === null ? (
                  <span className="text-2xl font-semibold text-asana-text-primary">Custom</span>
                ) : plan.price.monthly === 0 ? (
                  <span className="text-2xl font-semibold text-asana-text-primary">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold text-asana-text-primary">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-sm text-asana-text-secondary"> /user/month</span>
                  </>
                )}
              </div>
              <p className="text-xs text-asana-text-secondary mb-6">{plan.description}</p>

              <button className={`w-full mb-6 ${plan.ctaStyle}`}>
                {plan.cta}
              </button>

              <div className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {i === 0 && feature.startsWith('Everything') ? (
                      <span className="text-xs text-asana-text-secondary font-medium">{feature}</span>
                    ) : (
                      <>
                        <Check size={14} className="text-asana-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-asana-text-primary">{feature}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="w-full py-4 text-center text-sm font-medium text-asana-link hover:text-asana-coral transition-colors"
        >
          {showComparison ? 'Hide' : 'Show'} full feature comparison
        </button>

        {showComparison && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-asana-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-asana-text-primary w-1/5">
                    Feature
                  </th>
                  {['Personal', 'Starter', 'Advanced', 'Enterprise'].map(name => (
                    <th key={name} className="text-center py-3 px-4 text-sm font-semibold text-asana-text-primary w-1/5">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="border-b border-asana-border/50">
                    <td className="py-3 px-4 text-sm text-asana-text-primary">{feature.name}</td>
                    {['personal', 'starter', 'advanced', 'enterprise'].map(plan => {
                      const val = feature[plan as keyof typeof feature]
                      return (
                        <td key={plan} className="py-3 px-4 text-center">
                          {val === true ? (
                            <Check size={16} className="text-asana-success mx-auto" />
                          ) : val === false ? (
                            <X size={16} className="text-gray-300 mx-auto" />
                          ) : (
                            <span className="text-xs text-asana-text-primary">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-asana-bg-secondary py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-asana-text-primary text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I try a paid plan before purchasing?',
                a: 'Yes! You can start a free 30-day trial of any paid plan. No credit card required.',
              },
              {
                q: 'How does per-user pricing work?',
                a: 'You pay for each member who needs access to premium features. Guests with limited access are free.',
              },
              {
                q: 'Can I change plans at any time?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers for annual plans.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-lg border border-asana-border group">
                <summary className="cursor-pointer py-4 px-6 text-sm font-medium text-asana-text-primary list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-asana-text-secondary group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-asana-text-secondary">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
