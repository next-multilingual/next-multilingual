import Footer from '@/components/footer/Footer'
import { LanguageSwitcher } from '@/components/language-switcher/LanguageSwitcher'
import Head from 'next-multilingual/head'
import Link from 'next-multilingual/link'
import { useMessages } from 'next-multilingual/messages'
import { LocalizedRouteParameters } from 'next-multilingual/router'
import type { ReactElement, ReactNode } from 'react'
import styles from './Layout.module.css'

type LayoutProps = {
  /** The title of the page. */
  title: string
  /** Route parameters, if the page is using a dynamic route. */
  localizedRouteParameters?: LocalizedRouteParameters
  /** The child node of the `Layout` component. */
  children: ReactNode
}

/**
 * Component used for the general layout of a page.
 */
export const Layout: React.FC<LayoutProps> = ({
  title,
  localizedRouteParameters,
  children,
}): ReactElement => {
  const messages = useMessages()
  return (
    <>
      <Head localizedRouteParameters={localizedRouteParameters}>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        {/** Normally, this should have its own localized `description` content, but to avoid
         * unnecessary LightHouse warnings we are adding this line. */}
        <meta name="description" content={title}></meta>
      </Head>
      <header id="header" className={styles.header}>
        <div>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">{messages.format('header')}</a>
        </div>
        <LanguageSwitcher localizedRouteParameters={localizedRouteParameters} />
        <nav className={styles.nav}>
          <Link href="/">{messages.format('home')}</Link>
          {/* The link below uses a trailing slash by design to test that the behavior is the same as Next.js (no impact). */}
          <Link href="/about-us">{messages.format('aboutUs')}</Link>
          <Link href="/contact-us">{messages.format('contactUs')}</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  )
}
