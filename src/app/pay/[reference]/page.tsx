import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ reference: 'dummy' }];
}

export default function Page() {
  return <PageClient />;
}
