import React, { useRef } from 'react';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, Space, message, Modal, Badge } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';

type InventoryItem = {
    id: string;
    item_name: string;
    category: string;
    stock_quantity: number;
    unit: string;
    minimum_stock: number;
    price: number;
    vendor: string;
    notes: string;
};

const Inventory: React.FC = () => {
    const actionRef = useRef<ActionType>(null);

    const columns: ProColumns<InventoryItem>[] = [
        {
            title: '품명',
            dataIndex: 'item_name',
            copyable: true,
            ellipsis: true,
            formItemProps: {
                rules: [{ required: true, message: '품명을 입력해주세요' }],
            },
        },
        {
            title: '카테고리',
            dataIndex: 'category',
            valueType: 'select',
            valueEnum: {
                '임플란트': { text: '임플란트' },
                '소모품': { text: '소모품' },
                '충전재': { text: '충전재' },
                '인상재': { text: '인상재' },
                '기타': { text: '기타' },
            },
        },
        {
            title: '현재고',
            dataIndex: 'stock_quantity',
            valueType: 'digit',
            align: 'right',
            render: (_, record) => {
                const isLow = record.stock_quantity <= record.minimum_stock;
                return (
                    <Space>
                        <span style={{ color: isLow ? 'red' : 'inherit', fontWeight: isLow ? 'bold' : 'normal' }}>
                            {record.stock_quantity}
                        </span>
                        <span>{record.unit}</span>
                        {isLow && <Badge status="error" text="부족" />}
                    </Space>
                );
            },
        },
        {
            title: '최소재고',
            dataIndex: 'minimum_stock',
            valueType: 'digit',
            hideInSearch: true,
        },
        {
            title: '단가',
            dataIndex: 'price',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '거래처',
            dataIndex: 'vendor',
        },
        {
            title: '작업',
            valueType: 'option',
            width: 120,
            render: (_text, record, _, action) => [
                <a key="edit" onClick={() => action?.startEditable?.(record.id)}>수정</a>,
                <a key="delete" style={{ color: 'red' }} onClick={() => handleDelete(record.id)}>삭제</a>,
            ],
        },
    ];

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '재고 품목 삭제',
            content: '정말 삭제하시겠습니까?',
            onOk: async () => {
                const { error } = await supabase.from('dental_inventory').delete().eq('id', id);
                if (error) message.error(error.message);
                else {
                    message.success('삭제되었습니다.');
                    actionRef.current?.reload();
                }
            },
        });
    };

    return (
        <PageContainer title="재고 관리" subTitle="치과 물품 재고를 서버에서 실시간으로 관리하세요.">
            <ProTable<InventoryItem>
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                request={async (params) => {
                    let query = supabase.from('dental_inventory').select('*').order('created_at', { ascending: false });
                    if (params.item_name) query = query.ilike('item_name', `%${params.item_name}%`);
                    if (params.category) query = query.eq('category', params.category);

                    const { data, error } = await query;
                    return { data: data || [], success: !error, total: data?.length || 0 };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async (_key, record) => {
                        const { id, ...data } = record;
                        const { error } = await supabase.from('dental_inventory').update(data).eq('id', id);
                        if (error) throw error;
                    },
                }}
                toolBarRender={() => [
                    <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={async () => {
                            const { error } = await supabase.from('dental_inventory').insert([{
                                item_name: '신규 품목',
                                category: '소모품',
                                stock_quantity: 0,
                                unit: '개',
                                minimum_stock: 5,
                                price: 0
                            }]);
                            if (error) message.error(error.message);
                            else actionRef.current?.reload();
                        }}
                    >
                        품목 추가
                    </Button>,
                ]}
            />
        </PageContainer>
    );
};

export default Inventory;
