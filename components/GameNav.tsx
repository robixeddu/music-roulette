'use client'

import { useLocale } from '@/hooks/useLocale'
import { AppNav } from './AppNav'

interface GameNavProps {
  mode: 'artist' | 'genre'
  title: string
}

export function GameNav({ mode, title }: GameNavProps) {
  const { t } = useLocale()
  const backHref  = mode === 'artist' ? '/' : '/genres'
  const backLabel = mode === 'artist' ? t('nav.back.home') : t('nav.back.genres')
  return <AppNav backHref={backHref} backLabel={backLabel} title={title} showDot />
}