import React, { useState } from 'react';
import { Tabs, Badge } from 'antd';
import { LayoutDashboard, DollarSign, CreditCard, Package, Upload as UploadIcon } from 'lucide-react';
import { ConfigProvider } from 'antd';
import Dashboard from '../pages/Dashboard';
import Revenue from '../pages/Revenue';
import UploadPage from '../pages/Upload';
import Expenses from '../pages/Expenses';
import Inventory from '../pages/Inventory';

/**
 * 옵션 2: 카드 스타일 탭
 * - 상단에 카드 형태의 탭
 * - 더 강조된 디자인
 * - 배지(Badge) 지원
 */
export const TabLayoutOption2: React.FC = () => {
    const [activeKey, setActiveKey] = useState('dashboard');

    const items = [
        {
            key: 'dashboard',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </span>
            ),
            children: <Dashboard />,
        },
        {
            key: 'revenue',
            label: (
                <Badge count={5} offset={[10, 0]}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DollarSign size={18} />
                        <span>Revenue</span>
                    </span>
                </Badge>
            ),
            children: <Revenue />,
        },
        {
            key: 'expenses',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={18} />
                    <span>Expenses</span>
                </span>
            ),
            children: <Expenses />,
        },
        {
            key: 'inventory',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={18} />
                    <span>Inventory</span>
                </span>
            ),
            children: <Inventory />,
        },
        {
            key: 'upload',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UploadIcon size={18} />
                    <span>Upload</span>
                </span>
            ),
            children: <UploadPage />,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    colorBgLayout: '#f0f2f5',
                },
            }}
        >
            <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                {/* 헤더 */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        padding: '20px 24px',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#fff' }}>
                        Chan Dental Tax & Management
                    </h1>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: 14 }}>
                        Professional Dental Practice Management System
                    </p>
                </div>

                {/* 탭 - 카드 스타일 */}
                <div style={{ padding: '16px 24px 0' }}>
                    <Tabs
                        activeKey={activeKey}
                        onChange={setActiveKey}
                        items={items}
                        size="large"
                        type="card"
                        style={{
                            background: 'transparent',
                        }}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
};
