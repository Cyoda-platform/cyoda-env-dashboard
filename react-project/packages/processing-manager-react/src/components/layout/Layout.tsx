/**
 * Layout Component
 * Migrated from @cyoda/processing-manager/src/layout/PmLayoutSidebar.vue
 */

import { useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { useProcessingStore } from '../../stores/processingStore';
import { useAppStore } from '../../stores/appStore';
import './Layout.scss';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const params = useParams<{ name?: string }>();
  const nodes = useProcessingStore((state) => state.nodesProcessing);
  const setBaseUrl = useAppStore((state) => state.setBaseUrl);

  useEffect(() => {
    if (params.name && nodes && nodes.length > 0) {
      const node = nodes.find((el: any) => el.hostname === params.name);
      if (node) {
        setBaseUrl(node.baseUrl);
      }
    }
  }, [nodes, params.name, setBaseUrl]);

  return (
    <div>
      <Sidebar />
      <div className="c-wrapper">
        <Header />
        <div className="c-body">
          <main className="c-main">
            <div className="container-fluid">
              <div className="fade-in">{children}</div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

