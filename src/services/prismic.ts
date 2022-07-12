import { Client, createClient } from '@prismicio/client';

export function getPrismicClient(): Client {
  const prismic = createClient(process.env.PRISMIC_API_ENDPOINT, {
    // routes: [
    //   {
    //     type: 'posts',
    //     path: '/:uid',
    //   },
    // ],
  });

  return prismic;
}