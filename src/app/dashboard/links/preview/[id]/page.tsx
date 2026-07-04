import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ id: 'dummy' }];
}

export default function Page() {
  return <PageClient />;
}
