import { ReactElement, ReactNode } from 'react';
import { IntlHead } from '../../lib/intl-head';

interface LayoutProps {
  title: string;
  language?: string;
  children: ReactNode;
}
const Layout = ({ title, language, children }: LayoutProps): ReactElement => (
  <div>
    <IntlHead title={title} language={language}>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      />
    </IntlHead>
    <main>{children}</main>
  </div>
);

export default Layout;
