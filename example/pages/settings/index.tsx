import { useMessages, getTitle } from 'next-multilingual/messages';
import { MulLink } from 'next-multilingual/link';
import type { ReactElement } from 'react';
import Layout from '@/layout';
import styles from '../index.module.css';
import {useRouter} from "next/router";

export default function GeneralPage(): ReactElement {
  const { asPath } = useRouter()
  const messages = useMessages();
  const title = getTitle(messages).format();
  return (
    <Layout title={title}>
      <h1 className={styles.headline}>{title}</h1>
      <p>{messages.format('details')}</p>
      <MulLink href={`${asPath}/account`}>
        <a>Account</a>
      </MulLink>
    </Layout>
  );
}
