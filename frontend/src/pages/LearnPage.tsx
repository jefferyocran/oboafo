import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { T } from '../theme'
import { LEARN_CATEGORY_TEASERS } from '../data/learnCategories'
import { LearnCategoryCard } from '../components/LearnCategoryCard'
import { LanguageSelector } from '../components/LanguageSelector'
import { useLanguage } from '../context/LanguageContext'
import { useMediaQuery } from '../hooks/useMediaQuery'

export function LearnPage() {
  const { language, setLanguage } = useLanguage()
  const [q, setQ] = useState('')
  const isMobile = useMediaQuery('(max-width: 767px)')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return LEARN_CATEGORY_TEASERS
    return LEARN_CATEGORY_TEASERS.filter(
      (t) =>
        t.learnTitle.toLowerCase().includes(s) ||
        t.learnDescription.toLowerCase().includes(s),
    )
  }, [q])

  return (
    <div style={{ background: T.bg, minHeight: '100%' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: `${T.sp(4)} 20px ${T.sp(8)}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: T.sp(3),
            marginBottom: T.sp(4),
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: T.fontDisplay,
                fontSize: isMobile ? 32 : T.h1.size,
                fontWeight: T.h1.weight,
                lineHeight: T.h1.lh,
                color: T.primary,
                margin: `0 0 ${T.sp(1)}`,
              }}
            >
              Your Rights
            </h1>
            <p
              style={{
                fontFamily: T.fontBody,
                fontSize: T.body.size,
                color: T.textSecondary,
                margin: 0,
              }}
            >
              Choose a situation that applies to you
            </p>
          </div>
          <div>
            <p
              id="learn-lang-label"
              style={{
                fontFamily: T.fontBody,
                fontSize: T.caption.size,
                fontWeight: 600,
                color: T.textMuted,
                margin: `0 0 ${T.sp(1)}`,
              }}
            >
              Language
            </p>
            <LanguageSelector
              language={language}
              onChange={setLanguage}
              variant="pills"
              labelId="learn-lang-label"
            />
          </div>
        </div>

        <label style={{ display: 'block', marginBottom: T.sp(4) }}>
          <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
            Search for a right or situation
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a right or situation…"
            aria-label="Search for a right or situation"
            style={{
              width: '100%',
              maxWidth: 480,
              minHeight: 48,
              padding: '12px 18px',
              borderRadius: T.rFull,
              border: `1px solid ${T.border}`,
              background: T.surface,
              fontFamily: T.fontBody,
              fontSize: T.body.size,
              color: T.text,
              boxShadow: T.shadowCard,
            }}
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: T.sp(3),
          }}
        >
          {filtered.map((teaser, index) => (
            <LearnCategoryCard key={teaser.topicId} teaser={teaser} index={index} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ fontFamily: T.fontBody, color: T.textSecondary }}>
            No matches.{' '}
            <Link to="/ask" style={{ color: T.primary, fontWeight: 600 }}>
              Ask Oboafo
            </Link>{' '}
            instead.
          </p>
        )}
      </div>
    </div>
  )
}
