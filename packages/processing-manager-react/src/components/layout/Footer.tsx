/**
 * Footer Component
 * Migrated from @cyoda/processing-manager/src/components/PmFooter/PmFooter.vue
 */

import './Footer.scss';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="c-footer">
      <div className="left-column">
        <a href="https://cyoda.com/" target="_blank" rel="noopener noreferrer">
          Cyoda
        </a>{' '}
        &copy; {year}
        {/* TODO: Add CyodaVersion component when available */}
        {/* <CyodaVersion /> */}
      </div>
      <div className="ml-auto">
        Powered by&nbsp;
        <a href="https://cyoda.com/" target="_blank" rel="noopener noreferrer">
          Cyoda
        </a>
      </div>
    </footer>
  );
}

