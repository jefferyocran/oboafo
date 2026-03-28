import { Link } from 'react-router-dom'
import { T } from '../theme'
import type { LearnCategoryTeaser } from '../data/learnCategories'

interface LearnCategoryCardProps {
  teaser: LearnCategoryTeaser
  index: number
}

export function LearnCategoryCard({ teaser, index }: LearnCategoryCardProps) {
  const tone = index % 2 === 0 ? T.primary : T.accent
  const softBg = index % 2 === 0 ? 'rgba(27, 67, 50, 0.08)' : 'rgba(212, 160, 23, 0.12)'

  return (
    <Link
      to={`/topic/${teaser.topicId}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: T.surface,
        borderRadius: T.rMd,
        padding: T.sp(3),
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid transparent`,
        boxShadow: T.shadowCard,
        transition: T.tx,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 48,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = T.shadowHover
        e.currentTarget.style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLAnchorElement).style.borderLeft = `4px solid ${T.accent}`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = T.shadowCard
        e.currentTarget.style.transform = 'none'
        ;(e.currentTarget as HTMLAnchorElement).style.borderLeft = `1px solid ${T.border}`
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: softBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          marginBottom: T.sp(2),
        }}
      >
        {teaser.emoji}
      </div>
      <h3
        style={{
          fontFamily: T.fontDisplay,
          fontSize: T.h3.size,
          fontWeight: T.h3.weight,
          lineHeight: T.h3.lh,
          color: T.text,
          margin: `0 0 ${T.sp(1)}`,
        }}
      >
        {teaser.learnTitle}
      </h3>
      <p
        style={{
          fontFamily: T.fontBody,
          fontSize: T.body.size,
          lineHeight: T.body.lh,
          color: T.textSecondary,
          margin: `0 0 ${T.sp(2)}`,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {teaser.learnDescription}
      </p>
      <span
        style={{
          fontFamily: T.fontBody,
          fontSize: T.small.size,
          fontWeight: 600,
          color: tone,
        }}
      >
        Learn more →
      </span>
    </Link>
  )
}
