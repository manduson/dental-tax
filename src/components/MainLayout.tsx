
import React, { useState } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { LayoutDashboard, DollarSign, CreditCard, Package, Upload as UploadIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [pathname, setPathname] = useState(location.pathname);

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff', // Dental Blue
                    colorBgLayout: '#f0f2f5',
                },
            }}
        >
            <ProLayout
                title="Chan Dental Tax"
                logo={null} // Replace with actual logo if available
                layout="mix"
                splitMenus={false}
                contentWidth="Fluid"
                fixedHeader
                fixSiderbar
                location={{
                    pathname,
                }}
                menuItemRender={(item, dom) => (
                    <div
                        onClick={() => {
                            setPathname(item.path || '/');
                            navigate(item.path || '/');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        {dom}
                    </div>
                )}
                route={{
                    path: '/',
                    routes: [
                        {
                            path: '/',
                            name: 'Dashboard',
                            icon: <LayoutDashboard size={18} />,
                        },
                        {
                            path: '/revenue',
                            name: 'Revenue',
                            icon: <DollarSign size={18} />,
                        },
                        {
                            path: '/expenses',
                            name: 'Expenses',
                            icon: <CreditCard size={18} />,
                        },
                        {
                            path: '/inventory',
                            name: 'Inventory',
                            icon: <Package size={18} />,
                        },
                        {
                            path: '/upload',
                            name: 'Upload',
                            icon: <UploadIcon size={18} />,
                        },
                    ],
                }}
            >
                <div style={{ minHeight: '100vh', padding: 24 }}>
                    {children}
                </div>
            </ProLayout>
        </ConfigProvider>
    );
};
