import React, { useState } from 'react';
import { Tabs } from 'antd';
import { LayoutDashboard, DollarSign, CreditCard, Package, Upload as UploadIcon } from 'lucide-react';
import { ConfigProvider } from 'antd';
import Dashboard from '../pages/Dashboard';
import Revenue from '../pages/Revenue';
import UploadPage from '../pages/Upload';
import Expenses from '../pages/Expenses';
import Inventory from '../pages/Inventory';

/**
 * 옵션 1: 클린 & 미니멀 탭 (추천)
 * - 상단에 깔끔한 탭 바
 * - 아이콘 + 텍스트
 * - 전체 너비 사용
 */
export const TabLayoutOption1: React.FC = () => {
    const [activeKey, setActiveKey] = useState('dashboard');

    const items = [
        {
            key: 'dashboard',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LayoutDashboard size={16} />
                    Dashboard
                </span>
            ),
            children: <Dashboard />,
        },
        {
            key: 'revenue',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={16} />
                    Revenue
                </span>
            ),
            children: <Revenue />,
        },
        {
            key: 'expenses',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CreditCard size={16} />
                    Expenses
                </span>
            ),
            children: <Expenses />,
        },
        {
            key: 'inventory',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={16} />
                    Inventory
                </span>
            ),
            children: <Inventory />,
        },
        {
            key: 'upload',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UploadIcon size={16} />
                    Upload
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
                        background: '#fff',
                        padding: '16px 24px',
                        borderBottom: '1px solid #f0f0f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Chan Dental Tax</h1>
                </div>

                {/* 탭 */}
                <Tabs
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    items={items}
                    size="large"
                    style={{
                        background: '#fff',
                        padding: '0 24px',
                        margin: 0,
                    }}
                    tabBarStyle={{
                        marginBottom: 0,
                    }}
                />

                {/* 컨텐츠는 Tabs의 children으로 자동 렌더링 */}
            </div>
        </ConfigProvider>
    );
};
