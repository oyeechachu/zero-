import type { Metadata } from 'next';
import { WorkField } from '@/components/work-field';
import { projects } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Selected Work',
  description: 'Selected fashion films, brand films, campaigns, and production work by Zero Degree.',
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return (
    <WorkField projects={projects} />
  );
}
