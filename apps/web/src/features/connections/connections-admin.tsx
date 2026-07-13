'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListFlights } from '@/libs/api/generated/endpoints';
import { ConnectionChainForm } from './connection-chain-form';
import { SingleConnectionForm } from './single-connection-form';

export function ConnectionsAdmin() {
  const t = useTranslations('schedule.connections');
  const { data: flights } = useListFlights();

  return (
    <Tabs defaultValue="pair" className="w-full">
      <TabsList>
        <TabsTrigger value="pair">{t('pairTab')}</TabsTrigger>
        <TabsTrigger value="chain">{t('chainTab')}</TabsTrigger>
      </TabsList>
      <TabsContent value="pair" className="pt-4">
        <SingleConnectionForm flights={flights ?? []} />
      </TabsContent>
      <TabsContent value="chain" className="pt-4">
        <ConnectionChainForm flights={flights ?? []} />
      </TabsContent>
    </Tabs>
  );
}
