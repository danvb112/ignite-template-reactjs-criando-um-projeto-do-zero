import { AppProps } from 'next/app';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  //@ts-ignore
  return <Component {...pageProps} />;
}

export default MyApp;