import { useState, useEffect } from 'react';
import { Menu, Layout } from 'antd';
import { LayoutDashboard, DollarSign, CreditCard, Package, Upload as UploadIcon, Wallet } from 'lucide-react';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Revenue from './pages/Revenue';
import UploadPage from './pages/Upload';
import Expenses from './pages/Expenses';
import Inventory from './pages/Inventory';
import CreditCards from './pages/CreditCards';
import BusinessReport from './pages/BusinessReport';

import 'dayjs/locale/ko'; // 날짜 라이브러리 한글 설정

const { Header, Content } = Layout;

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // URL 경로를 기반으로 초기 탭 설정 (새로고침 시 유지용)
  const initialKey = location.pathname.split('/')[1] || 'dashboard';
  const [selectedKey, setSelectedKey] = useState(initialKey === 'business-report' ? 'business_report' : initialKey);

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    const key = path === 'business-report' ? 'business_report' : path;
    setSelectedKey(key);
  }, [location.pathname]);

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
      key: 'creditcards',
      icon: <Wallet size={16} />,
      label: '신용카드',
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
      key: 'business_report',
      icon: <Wallet size={16} />,
      label: '사업장현황신고',
    },
    {
      key: 'upload',
      icon: <UploadIcon size={16} />,
      label: 'Upload',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    const path = key === 'business_report' ? '/business-report' : `/${key}`;
    navigate(path + location.search); // 연도 정보(?year=...) 유지하며 이동
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'revenue':
        return <Revenue />;
      case 'creditcards':
        return <CreditCards />;
      case 'expenses':
        return <Expenses />;
      case 'inventory':
        return <Inventory />;
      case 'business_report':
        return <BusinessReport />;
      case 'upload':
        return <UploadPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider
      locale={koKR}
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
            onClick={handleMenuClick}
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
}

export default App;
