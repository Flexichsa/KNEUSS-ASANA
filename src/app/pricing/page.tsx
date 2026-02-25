'use client'

import { useState } from 'react'
import { Check, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Personal',
    price: { monthly: 0, annual: 0 },
    description: 'Für Einzelpersonen, die mit Projektmanagement beginnen',
    cta: 'Aktueller Plan',
    ctaStyle: 'asana-btn-secondary',
    highlighted: false,
    features: [
      'Unbegrenzte Aufgaben',
      'Bis zu 10 Teammitglieder',
      'Listenansicht',
      'Board-Ansicht',
      'Kalenderansicht',
      'Einfache Suche',
      'Mobile App',
    ],
  },
  {
    name: 'Starter',
    price: { monthly: 10.99, annual: 8.99 },
    description: 'Für kleine Teams, die Arbeit verwalten und Zusammenarbeit skalieren müssen',
    cta: 'Upgrade',
    ctaStyle: 'asana-btn-primary',
    highlighted: true,
    features: [
      'Alles aus Personal, plus:',
      'Zeitachsenansicht',
      'Dashboards',
      'Erweiterte Suche & Berichte',
      'Unbegrenzte Teammitglieder',
      'Benutzerdefinierte Felder',
      'Aufgabenabhängigkeiten',
      'Startdaten',
    ],
  },
  {
    name: 'Advanced',
    price: { monthly: 24.99, annual: 19.99 },
    description: 'Für Teams, die ein Arbeitsportfolio verwalten und über Fortschritte berichten müssen',
    cta: 'Upgrade',
    ctaStyle: 'asana-btn-primary',
    highlighted: false,
    features: [
      'Alles aus Starter, plus:',
      'Portfolios',
      'Ziele',
      'Benutzerdefinierter Regelersteller',
      'Genehmigungen',
      'Korrekturlesen',
      'Formularverzweigung & -anpassung',
      'Erweiterte Integrationen',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'Für Organisationen, die zusätzliche Sicherheit, Support und Kontrolle benötigen',
    cta: 'Vertrieb kontaktieren',
    ctaStyle: 'asana-btn-secondary',
    highlighted: false,
    features: [
      'Alles aus Advanced, plus:',
      'SAML & SSO',
      'Datenexport',
      'Eigenes Branding',
      'Prioritäts-Support',
      'Erweiterte Admin-Steuerung',
      'Dienstkonten',
      'Audit-Log-API',
    ],
  },
]

const comparisonFeatures = [
  { name: 'Unbegrenzte Aufgaben', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Teammitglieder', personal: 'Bis zu 10', starter: 'Unbegrenzt', advanced: 'Unbegrenzt', enterprise: 'Unbegrenzt' },
  { name: 'Listenansicht', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Board-Ansicht', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Kalenderansicht', personal: true, starter: true, advanced: true, enterprise: true },
  { name: 'Zeitachsenansicht', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Dashboards', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Benutzerdefinierte Felder', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Aufgabenabhängigkeiten', personal: false, starter: true, advanced: true, enterprise: true },
  { name: 'Portfolios', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Ziele', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Benutzerdefinierte Regeln', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'Genehmigungen', personal: false, starter: false, advanced: true, enterprise: true },
  { name: 'SAML & SSO', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Datenexport', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Eigenes Branding', personal: false, starter: false, advanced: false, enterprise: true },
  { name: 'Prioritäts-Support', personal: false, starter: false, advanced: false, enterprise: true },
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
            <span className="text-sm">Zurück</span>
          </Link>
          <Link href="/home">
            <img src="/kneuss-logo.svg" alt="Kneuss" className="h-7" />
          </Link>
          <div className="w-24" />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-12 px-4">
        <h1 className="text-3xl font-semibold text-asana-text-primary mb-3">
          Wählen Sie den richtigen Plan für Ihr Team
        </h1>
        <p className="text-asana-text-secondary max-w-lg mx-auto">
          Ob Team von 2 oder 200 – Kneuss bietet flexible Preispläne für Ihre Anforderungen.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${!isAnnual ? 'text-asana-text-primary font-medium' : 'text-asana-text-secondary'}`}>
            Monatlich
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
            Jährlich
          </span>
          {isAnnual && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Bis zu 18% sparen
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
                  Beliebteste Wahl
                </div>
              )}
              <h3 className="text-lg font-semibold text-asana-text-primary">{plan.name}</h3>
              <div className="mt-3 mb-1">
                {plan.price.monthly === null ? (
                  <span className="text-2xl font-semibold text-asana-text-primary">Individuell</span>
                ) : plan.price.monthly === 0 ? (
                  <span className="text-2xl font-semibold text-asana-text-primary">Kostenlos</span>
                ) : (
                  <>
                    <span className="text-3xl font-semibold text-asana-text-primary">
                      CHF {isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-sm text-asana-text-secondary"> /Nutzer/Monat</span>
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
                    {i === 0 && feature.startsWith('Alles') ? (
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
          Vollständigen Funktionsvergleich {showComparison ? 'ausblenden' : 'anzeigen'}
        </button>

        {showComparison && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-asana-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-asana-text-primary w-1/5">
                    Funktion
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
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Kann ich einen kostenpflichtigen Plan vor dem Kauf testen?',
                a: 'Ja! Sie können eine kostenlose 30-tägige Testversion jedes kostenpflichtigen Plans starten. Keine Kreditkarte erforderlich.',
              },
              {
                q: 'Wie funktioniert die Preisgestaltung pro Nutzer?',
                a: 'Sie zahlen für jedes Mitglied, das Zugang zu Premium-Funktionen benötigt. Gäste mit eingeschränktem Zugang sind kostenlos.',
              },
              {
                q: 'Kann ich den Plan jederzeit wechseln?',
                a: 'Ja, Sie können Ihren Plan jederzeit upgraden oder downgraden. Änderungen werden sofort wirksam.',
              },
              {
                q: 'Welche Zahlungsmethoden akzeptieren Sie?',
                a: 'Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, American Express) und Banküberweisungen für Jahrespläne.',
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
