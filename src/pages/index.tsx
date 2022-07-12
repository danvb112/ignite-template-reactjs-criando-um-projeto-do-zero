import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { PrismicDocument, Query } from '@prismicio/types';
import { predicate } from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  slug?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

/* eslint @typescript-eslint/no-explicit-any: ["off"] */
function returnFormatedPosts(results: Record<string, any>[]): Post[] {
  return results.map(post => {
    return {
      slug: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: post.data,
    };
  });
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState(returnFormatedPosts(results));
  const [nextPage, setNextPage] = useState(next_page);

  async function handleLoadMorePosts(): Promise<void> {
    await fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        setNextPage(data.next_page);
        setPosts([...posts, ...returnFormatedPosts(data.results)]);
      });
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.contentContainer}>
        <div className={styles.contentLogo}>
          <img src="/images/logo.svg" alt="logo" />
        </div>

        <div className={styles.contentPosts}>
          {posts.map(post => (
            <div key={post.slug}>
              <Link href={`/post/${post.slug}`}>
                <a>
                  <div className={styles.bar} />
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>

                  <div className={commonStyles.contentPostsAuthor}>
                    <div>
                      <FiCalendar size="1.25rem" />
                      {post.first_publication_date}
                    </div>
                    <div>
                      <FiUser size="1.25rem" />
                      {post.data.author}
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>

        {nextPage && (
          <button
            type="button"
            className={styles.contentMorePosts}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  let postsResponse: Query<
    PrismicDocument<Record<string, any>, string, string>
  >;

  if (!process.env.PRISMIC_OLD_VERSION) {
    postsResponse = await prismic.query('');
  } else {
    postsResponse = await prismic.get({
      predicates: [predicate.at('document.type', 'posts')],
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
    });
  }

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
  };
};