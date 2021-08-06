import Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown){
  const prismic = Prismic.client('https://ap-sujeito.prismic.io/api/v2', {
    req,
  });

  return prismic;
}