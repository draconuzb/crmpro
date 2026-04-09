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
      message.error(t('settings.failedToLoadPosts'));
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
        message.success(t('settings.postUpdated'));
      } else {
        await createBlogPost(values);
        message.success(t('settings.postCreated'));
      }
      setDrawerOpen(false);
      form.resetFields();
      setEditingPost(null);
      loadPosts();
    } catch {
      message.error(t('settings.failedToSavePost'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlogPost(id);
      message.success(t('settings.postDeleted'));
      loadPosts();
    } catch {
      message.error(t('settings.failedToDeletePost'));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
    );
  };

  const columns = [
    {
      title: t('common.title'),
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: BlogPost) => (
        <a onClick={() => toggleExpand(record.id)}>{title}</a>
      ),
    },
    {
      title: t('settings.published'),
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (published: boolean) => (
        <Badge color={published ? 'green' : 'gray'} text={published ? t('settings.published') : t('settings.draft')} />
      ),
    },
    {
      title: t('common.createdDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: unknown, record: BlogPost) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openDrawer(record)}
          />
          <Popconfirm title={t('settings.deletePostConfirm')} onConfirm={() => handleDelete(record.id)}>
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
        items={[{ title: t('common.settings') }, { title: t('settings.blog') }]}
        style={{ marginBottom: 16 }}
      />
      <Title level={2}>{t('pages.blog')}</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openDrawer()}
        style={{ marginBottom: 16 }}
      >
        {t('settings.addPost')}
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
        title={editingPost ? t('settings.editPost') : t('settings.createPost')}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          form.resetFields();
          setEditingPost(null);
        }}
        width={520}
        extra={
          <Button type="primary" onClick={handleSave}>
            {t('common.save')}
          </Button>
        }
      >
        <Form form={form} layout="vertical" initialValues={{ isPublished: false }}>
          <Form.Item name="title" label={t('common.title')} rules={[{ required: true }]}>
            <Input placeholder={t('settings.postTitlePlaceholder')} />
          </Form.Item>
          <Form.Item name="content" label={t('settings.content')} rules={[{ required: true }]}>
            <TextArea rows={10} placeholder={t('settings.contentPlaceholder')} />
          </Form.Item>
          <Form.Item name="isPublished" label={t('settings.published')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default BlogPage;
