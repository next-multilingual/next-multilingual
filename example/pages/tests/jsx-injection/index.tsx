import { NextPage } from 'next'
import Link from 'next-multilingual/link'
import { getTitle, useMessages } from 'next-multilingual/messages'

import Layout from '@/layout'

import styles from './index.module.css'

// Extend `Window` object to add our test's counter.
declare global {
  interface Window {
    _styleAndEventsClickCount: number
  }
}

const JsxTests: NextPage = () => {
  const messages = useMessages()
  const title = getTitle(messages)

  return (
    <Layout title={title}>
      <div>
        {/**
         * +-----------------------------------------------------------------------------------------------+
         * |                                                                                               |
         * | The tests below should output localized messages and allow us to test certain functionalities |
         * |                                                                                               |
         * +-----------------------------------------------------------------------------------------------+
         */}
        {/* Base test: one JSX element */}
        <div id="baseTest1">
          {messages.formatJsx('baseTest1', { link: <Link href="/contact-us"></Link> })}
        </div>
        {/* Base test: two child elements inside another element */}
        <div id="baseTest2">
          {messages.formatJsx('baseTest2', {
            link: (
              <Link href="/contact-us">
                <a></a>
              </Link>
            ),
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Plural + JSX test */}
        <div id="plurals">
          {/* count = 0 */}
          <div id="plural0">
            {messages.formatJsx('plural', {
              count: 0,
              strong: <strong></strong>,
              i: <i></i>,
              u: <u></u>,
            })}
          </div>
          {/* count = 1 */}
          <div id="plural1">
            {messages.formatJsx('plural', {
              count: 1,
              strong: <strong></strong>,
              i: <i></i>,
              u: <u></u>,
            })}
          </div>
          {/* count = 2 */}
          <div id="plural2">
            {messages.formatJsx('plural', {
              count: 2,
              strong: <strong></strong>,
              i: <i></i>,
              u: <u></u>,
            })}
          </div>
        </div>
        {/* Escape test: `formatJsx` using '<', '>', '{', '}' and quotes */}
        <div id="escapeTest">
          {messages.formatJsx('escapeTest', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Test that JSX elements can support style and events */}
        <div id="styleAndEvents">
          {messages.formatJsx('styleAndEvents', {
            strong: <strong className={styles.strong}></strong>,
            link: (
              <Link href="/contact-us">
                <a
                  className={styles.link}
                  onClick={(event) => {
                    event.preventDefault()
                    if (typeof window !== 'undefined') {
                      if (typeof window['_styleAndEventsClickCount'] === 'undefined') {
                        window['_styleAndEventsClickCount'] = 1
                      } else {
                        window['_styleAndEventsClickCount']++
                      }
                      console.log(
                        messages.format('styleAndEventsConsole', {
                          clickCount: window['_styleAndEventsClickCount'],
                        })
                      )
                    }

                    return false
                  }}
                ></a>
              </Link>
            ),
          })}
        </div>
        {/**
         * +---------------------------------------------------------------------+
         * |                                                                     |
         * | The tests below should not output anything as they are all failing  |
         * |         They should only display console warning messages.          |
         * |                                                                     |
         * +---------------------------------------------------------------------+
         */}
        {/* Missing closing XML tag */}
        <div id="missingClose1">
          {messages.formatJsx('missingClose1', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing closing XML tag at the end */}
        <div id="missingClose2">
          {messages.formatJsx('missingClose2', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing closing XML tag at the beginning */}
        <div id="missingClose3">
          {messages.formatJsx('missingClose3', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing closing embedded XML tag */}
        <div id="missingClose4">
          {messages.formatJsx('missingClose4', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing closing embedded XML tag at the end tag */}
        <div id="missingClose5">
          {messages.formatJsx('missingClose5', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing closing embedded XML tag at the end tag */}
        <div id="missingClose6">
          {messages.formatJsx('missingClose6', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing closing embedded XML tag at the end tag (multi) */}
        <div id="missingClose7">
          {messages.formatJsx('missingClose7', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>

        {/* Missing opening XML tag */}
        <div id="missingOpen1">
          {messages.formatJsx('missingOpen1', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing opening XML tag at the end */}
        <div id="missingOpen2">
          {messages.formatJsx('missingOpen2', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing opening XML tag at the beginning */}
        <div id="missingOpen3">
          {messages.formatJsx('missingOpen3', {
            strong: <strong></strong>,
          })}
        </div>
        {/* Missing opening embedded XML tag */}
        <div id="missingOpen4">
          {messages.formatJsx('missingOpen4', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing opening embedded XML tag at the end tag */}
        <div id="missingOpen5">
          {messages.formatJsx('missingOpen5', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing opening embedded XML tag at the end tag */}
        <div id="missingOpen6">
          {messages.formatJsx('missingOpen6', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>
        {/* Missing opening embedded XML tag at the end tag (multi) */}
        <div id="missingOpen7">
          {messages.formatJsx('missingOpen7', {
            strong: <strong></strong>,
            i: <i></i>,
          })}
        </div>

        {/* Invalid XML tags: invalid tag name */}
        <div id="invalidXml1">
          {messages.formatJsx('invalidXml1', {
            'strong-tag': <strong></strong>,
          })}
        </div>

        {/* Invalid XML tags: using an attribute */}
        <div id="invalidXml2">
          {messages.formatJsx('invalidXml2', {
            span: <span></span>,
          })}
        </div>

        {/* Duplicate tag */}
        <div id="duplicateTags">
          {messages.formatJsx('duplicateTags', {
            strong: <strong></strong>,
          })}
        </div>

        {/* Invalid message value: wrong value type (variable instead of JSX) */}
        <div id="badMessageValue1">
          {messages.formatJsx('badMessageValue1', { strong: 'strong' })}
        </div>

        {/* Invalid message value: wrong value type (JSX instead of variable) */}
        <div id="badMessageValue2">
          {messages.formatJsx('badMessageValue2', { message: <strong></strong> })}
        </div>

        {/* Bad JSX element: multi-child */}
        <div id="badJsxElement1">
          {messages.formatJsx('badJsxElement1', {
            strong: (
              <>
                <strong></strong>
                <strong></strong>
              </>
            ),
          })}
        </div>

        {/* Bad JSX element: message inside JSX*/}
        <div id="badJsxElement2">
          {messages.formatJsx('badJsxElement2', {
            strong: <strong>message</strong>,
          })}
        </div>
      </div>
    </Layout>
  )
}

export default JsxTests
