import React, { useEffect, useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
  Row,
  Col,
  message,
  Popconfirm,
  Space,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../features/gamification/api';

const { Title, Text, Paragraph } = Typography;

interface Product {
  id: number;
  name: string;
  description?: string;
  image?: string;
  coinPrice: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

const ShopPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      image: product.image,
      coinPrice: product.coinPrice,
      stock: product.stock,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        message.success('Product updated');
      } else {
        await createProduct(values);
        message.success('Product created');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch {
      message.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted');
      fetchProducts();
    } catch {
      message.error('Failed to delete product');
    }
  };

  return (
    <>
      <Breadcrumb
        items={[{ title: 'Gamification' }, { title: 'Shop' }]}
        style={{ marginBottom: 16 }}
      />

      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          {t('pages.shop')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Add Product
        </Button>
      </Space>

      {loading ? (
        <Card loading />
      ) : products.length === 0 ? (
        <Empty description="No products yet" />
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  product.image ? (
                    <img
                      alt={product.name}
                      src={product.image}
                      style={{ height: 180, objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5',
                      }}
                    >
                      <GiftOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    </div>
                  )
                }
                actions={[
                  <EditOutlined key="edit" onClick={() => openEditModal(product)} />,
                  <Popconfirm
                    key="delete"
                    title="Delete this product?"
                    onConfirm={() => handleDelete(product.id)}
                  >
                    <DeleteOutlined />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <>
                      {product.description && (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 8 }}
                          type="secondary"
                        >
                          {product.description}
                        </Paragraph>
                      )}
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 16 }}>
                          {product.coinPrice} coins
                        </Text>
                        <Text type="secondary">Stock: {product.stock}</Text>
                      </Space>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingProduct ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Product name" />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Product description" />
          </Form.Item>
          <Form.Item label="Image URL" name="image">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item
            label="Coin Price"
            name="coinPrice"
            rules={[{ required: true, message: 'Please enter coin price' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="100" />
          </Form.Item>
          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ required: true, message: 'Please enter stock amount' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="10" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ShopPage;
