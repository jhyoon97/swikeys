import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSwitchById, getSwitches } from '@/lib/notion/switches';
import SwitchDetail from '@/components/switch/SwitchDetail';
import CommentSection from '@/components/comment/CommentSection';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { id } = await params;
  const sw = await getSwitchById(id);
  if (!sw) return { title: 'Switch Not Found' };

  return {
    title: `${sw.name} - SwiKey`,
    description: `${sw.name} (${sw.type}) - ${sw.manufacturer ?? ''} | 키보드 스위치 상세 정보`,
    openGraph: {
      title: `${sw.name} - SwiKey`,
      description: `${sw.name} 키보드 스위치 상세 정보`,
      images: sw.image ? [sw.image] : undefined,
    },
  };
};

export const generateStaticParams = async () => {
  try {
    const switches = await getSwitches(20);
    return switches.map((sw) => ({ id: sw.id }));
  } catch {
    return [];
  }
};

const SwitchDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const sw = await getSwitchById(id);

  if (!sw) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SwitchDetail sw={sw} />
      <div className="mt-12">
        <CommentSection switchId={sw.id} />
      </div>
    </div>
  );
};

export default SwitchDetailPage;
