import { useState } from 'react';
import { GetStaticProps} from 'next';
import Head from 'next/head';

import styles from './styles.module.scss';
import Link from 'next/link';

import Image from 'next/image';

import { FiChevronLeft, FiChevronsLeft, FiChevronRight, FiChevronsRight} from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

type Post = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  updateAt: string;
}

interface PostsProps{
  posts: Post[];
  page: string;
  totalPage: string;
}

export default function Posts({ posts: postsBlog, page, totalPage }: PostsProps){

  const [currnentPage, setCurrentPage] = useState(Number(page))
  const [posts, setPosts] = useState(postsBlog || [])

  async function reqPost(pageNumber: number){
    const prismic = getPrismicClient();

    const response = await prismic.query([
      Prismic.Predicates.at('document.type', 'post')
    ],{
      orderings: '[document.last_publication_date desc]',
      fetch: ['post.title', 'post.description', 'post.cover'],
      pageSize: 3,
      page: String(pageNumber),
    });

    return response;
  }

  async function handleNaigatePage(pageNumber: number){
    const response = await reqPost(pageNumber);

    if(!response.results.length){
      return;
    }

    const getPosts = response.results.map( post => {
      return {
        slug: post.uid,
        title: RichText.asText(post.data.title),
        description: post.data.description.find(content => content.type === 'paragraph')?.text ?? '',
        cover: post.data.cover.url,
        updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
      }
    })
    
    setPosts(getPosts);
    setCurrentPage(pageNumber);
  }

  return(
    <>
     <Head>
       <title>Blog | Sujeito Programador</title>
     </Head>
     <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map( post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <Image 
                  src={post.cover} 
                  alt={post.title}
                  width={720}
                  height={410}
                  quality={100}
                  placeholder="blur"
                  blurDataURL={`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPk2PnpGgAFDwKL7OTA8AAAAABJRU5ErkJggg==`}
                />
                <strong>{post.title}</strong>
                <time>{post.updateAt}</time>
                <p>{post.description}</p>
              </a>
            </Link>
          ))}
          <div className={styles.buttonNavigate}>

            {Number(currnentPage) >= 2 && (
              <div>
                <button onClick={() => handleNaigatePage(1)}>
                  <FiChevronsLeft size={25} color="#FFF" />
                </button>
                <button onClick={() => handleNaigatePage(Number(currnentPage - 1))}>
                  <FiChevronLeft size={25} color="#FFF" />
                </button>
              </div>
            )}

            {Number(currnentPage) < Number(totalPage) && (
              <div>
                <button onClick={() => handleNaigatePage(Number(currnentPage + 1))}>
                  <FiChevronRight size={25} color="#FFF" />
                </button>
                <button onClick={() => handleNaigatePage(Number(totalPage))}>
                  <FiChevronsRight size={25} color="#FFF" />
                </button>
              </div>
            )}
          </div>
        </div>
     </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.Predicates.at('document.type','post')
  ],{
    orderings: '[document.last_publication_date desc]',
    fetch: ['post.title', 'post.description', 'post.cover'],
    pageSize: 3,
  });

  const posts = response.results.map( post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      description: post.data.description.find(content => content.type === 'paragraph')?.text ?? '',
      cover: post.data.cover.url,
      updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
    }
  })


  return {
    props: {
      posts,
      page: response.page,
      totalPage: response.total_pages
    },
    revalidate: 60 * 30
  }
}