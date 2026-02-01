import React, { useState } from 'react';
import { Menu, Layout } from 'antd';
import { LayoutDashboard, DollarSign, CreditCard, Package, Upload as UploadIcon } from 'lucide-react';
import { ConfigProvider } from 'antd';
import Dashboard from '../pages/Dashboard';
import Revenue from '../pages/Revenue';
import UploadPage from '../pages/Upload';
import Expenses from '../pages/Expenses';
import Inventory from '../pages/Inventory';

const { Header, Content } = Layout;

/**
 * 옵션 3: 메뉴 바 스타일 (프로페셔널)
 * - 상단 메뉴 바 형태
 * - 더 전문적인 느낌
 * - 추가 메뉴 항목 확장 가능
 */
export const TabLayoutOption3: React.FC = () => {
    const [selectedKey, setSelectedKey] = useState('dashboard');

    const menuItems = [
        {
            key: 'dashboard',
            icon: <LayoutDashboard size={16} />,
            label: 'Dashboard',
        },
        {
            key: 'revenue',
            icon: <DollarSign size={16} />,
            label: 'Revenue',
        },
        {
            key: 'expenses',
            icon: <CreditCard size={16} />,
            label: 'Expenses',
        },
        {
            key: 'inventory',
            icon: <Package size={16} />,
            label: 'Inventory',
        },
        {
            key: 'upload',
            icon: <UploadIcon size={16} />,
            label: 'Upload',
        },
    ];

    const renderContent = () => {
        switch (selectedKey) {
            case 'dashboard':
                return <Dashboard />;
            case 'revenue':
                return <Revenue />;
            case 'expenses':
                return <Expenses />;
            case 'inventory':
                return <Inventory />;
            case 'upload':
                return <UploadPage />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    colorBgLayout: '#f0f2f5',
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        padding: '0 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    {/* 로고 */}
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                            marginRight: 48,
                            color: '#1890ff',
                        }}
                    >
                        Chan Dental Tax
                    </div>

                    {/* 메뉴 */}
                    <Menu
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        onClick={({ key }) => setSelectedKey(key)}
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                        }}
                    />
                </Header>

                <Content style={{ padding: 24, background: '#f0f2f5' }}>
                    {renderContent()}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};
