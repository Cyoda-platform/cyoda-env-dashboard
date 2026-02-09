/**
 * Menu item type definition
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/components-library/elements/Home/Menu.ts
 */
export interface MenuItem {
  name: string
  link?: string
  description?: string
  localhostLink?: string
  isRouterLink?: boolean
}

export const defaultMenuItems: MenuItem[] = [
  {
    name: 'Entity Model Viewer',
    link: '/http-api/entity-viewer',
    description: 'Display entity model',
    localhostLink: 'http://localhost:3007/http-api/entity-viewer',
    isRouterLink: false,
  },
  {
    name: 'Catalogue of Aliases',
    link: '/http-api/catalog-of-aliases',
    description: 'Build data views or business object of the raw data using alias and mappers. The Schema to read',
    localhostLink: 'http://localhost:3007/http-api/catalog-of-aliases',
    isRouterLink: false,
  },
  {
    name: 'Composite indexes',
    link: '/http-api/composite-indexes',
    description: '',
    localhostLink: 'http://localhost:3007/http-api/composite-indexes',
    isRouterLink: false,
  },
  {
    name: 'Caches list',
    link: '/http-api/caches-list',
    description: '',
    localhostLink: 'http://localhost:3007/http-api/caches-list',
    isRouterLink: false,
  },
  {
    name: 'Network info',
    link: '/http-api/network-info',
    description: '',
    localhostLink: 'http://localhost:3007/http-api/network-info',
    isRouterLink: false,
  },
  {
    name: 'ZooKeeper info',
    link: '/http-api/zk-info',
    description: '',
    localhostLink: 'http://localhost:3007/http-api/zk-info',
    isRouterLink: false,
  },
  {
    name: 'Reporting',
    link: '/http-api/config-editor',
    description: 'Configure reports (distributed and stream) and view reports',
    localhostLink: 'http://localhost:3007/http-api/config-editor',
    isRouterLink: false,
  },
  {
    name: 'delimiter',
  },
  {
    name: 'COBI',
    link: '/data-mapper',
    localhostLink: 'http://localhost:3009/data-mapper',
    description: '',
  },
  {
    name: 'delimiter',
  },
  {
    name: 'Workflow Designer',
    link: '/statemachine',
    localhostLink: 'http://localhost:3004/statemachine',
    description: 'Build and edit the realtime and batch business logic of the system',
  },
  {
    name: 'Process Manager',
    link: '/processing/platform-processing/index.do',
    localhostLink: 'http://localhost:8081/processing/platform-processing/index.do',
    description: 'Monitor queue, transactions and consistency time of the running system.',
  },
  {
    name: 'System Monitor',
    link: '/processing',
    localhostLink: 'http://localhost:3008/',
    description: 'Memory, IO, network monitoring',
  },
  {
    name: 'delimiter',
  },
  {
    name: 'Tasks Stations',
    link: '/tasks',
    localhostLink: 'http://localhost:3010/tasks',
    description: '',
  },
]

