import Link from 'next/link'
import styles from './AppNav.module.css'

interface AppNavProps {
  backHref: string
  backLabel: string
  title: string
  showDot?: boolean
}

export function AppNav({ backHref, backLabel, title, showDot = false }: AppNavProps) {
  return (
    <nav className={styles.nav}>
      <Link href={backHref} className={styles.back}>
        ← {backLabel}
      </Link>
      <span className={styles.title}>
        {showDot && <span className={styles.dot} aria-hidden="true" />}
        {title}
      </span>
    </nav>
  )
}