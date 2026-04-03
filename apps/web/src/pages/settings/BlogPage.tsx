import { useState, useEffect } from 'react';
import {
  Typography,
  Breadcrumb,
  Table,
  Button,
  Switch,
  Space,
  Drawer,
  Form,
  Input,
  Badge,
  Popconfirm,
  message,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../../features/settings/api';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface BlogPost {
  id: number;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
}

const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  const [form] = Form.useForm();

  const loadPosts = async () => {
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch {
      message.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openDrawer = (record?: BlogPost) => {
    if (record) {
      setEditingPost(record);
      form.setFieldsValue({
        title: record.title,
        content: record.content,
        isPublished: record.isPublished,
      });
    } else {
      setEditingPost(null);
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPost) {
        await updateBlogPost(editingPost.id, values);
        message.success('Post updated');
      } else {
        await createBlogPost(values);
        message.success('Post created');
      }
      setDrawerOpen(false);
      form.resetFields();
      setEditingPost(null);
      loadPosts();
    } catch {
      message.error('Failed to save post');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlogPost(id);
      message.success('Post deleted');
      loadPosts();
    } catch {
      message.error('Failed to delete post');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: BlogPost) => (
        <a onClick={() => toggleExpand(record.id)}>{title}</a>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (published: boolean) => (
        <Badge color={published ? 'green' : 'gray'} text={published ? 'Published' : 'Draft'} />
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: BlogPost) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openDrawer(record)}
          />
          <Popconfirm title="Delete this post?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Settings' }, { title: 'Blog' }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.blog')}</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openDrawer()}
        style={{ marginBottom: 16 }}
      >
        Add Post
      </Button>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowKeys: expandedKeys,
          expandedRowRender: (record: BlogPost) => (
            <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {record.content}
            </Paragraph>
          ),
          showExpandColumn: false,
        }}
      />

      <Drawer
        title={editingPost ? 'Edit Post' : 'Create Post'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditingPost(null);
        }}
        width={520}
        extra={
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ isPublished: false }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Post title" />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <TextArea rows={10} placeholder="Write your blog post content here..." />
          </Form.Item>
          <Form.Item name="isPublished" label="Published" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default BlogPage;
