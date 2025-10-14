/**
 * Blog Main Page Component
 * Migrated from @cyoda/processing-manager/src/components/PmBlogMainPage/PmBlogMainPage.vue
 */

import React from 'react';
import { Row, Col } from 'antd';
import './BlogMainPage.scss';

interface Post {
  link: string;
  title: string;
  description: string;
}

interface BlogMainPageProps {
  posts?: Post[];
}

export const BlogMainPage: React.FC<BlogMainPageProps> = ({ posts = [] }) => {
  return (
    <div>
      {posts.map((post) => (
        <Row key={post.link} className="post">
          <Col md={24}>
            <div className="title">
              <a href={post.link} target="_blank" rel="noopener noreferrer">
                {post.title}
              </a>
            </div>
            <div className="description">{post.description}</div>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default BlogMainPage;

