import React, { useRef } from 'react';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';

type ExpenseItem = {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    payment_method: string;
    vendor: string;
};

const Expenses: React.FC = () => {
    const actionRef = useRef<ActionType>(null);

    const columns: ProColumns<ExpenseItem>[] = [
        {
            title: '날짜',
            dataIndex: 'date',
            valueType: 'date',
            sorter: true,
            width: 120,
        },
        {
            title: '카테고리',
            dataIndex: 'category',
            valueType: 'select',
            valueEnum: {
                '재료비': { text: '재료비' },
                '인건비': { text: '인건비' },
                '임대료': { text: '임대료' },
                '유틸리티': { text: '유틸리티' },
                '기타': { text: '기타' },
            },
            width: 120,
        },
        {
            title: '설명',
            dataIndex: 'description',
            ellipsis: true,
        },
        {
            title: '금액',
            dataIndex: 'amount',
            valueType: 'money',
            sorter: true,
            align: 'right',
            width: 150,
        },
        {
            title: '결제수단',
            dataIndex: 'payment_method',
            width: 120,
        },
        {
            title: '거래처',
            dataIndex: 'vendor',
            width: 150,
        },
        {
            title: '작업',
            valueType: 'option',
            width: 120,
            render: (_text, record, _, action) => [
                <a
                    key="edit"
                    onClick={() => {
                        action?.startEditable?.(record.id);
                    }}
                >
                    수정
                </a>,
                <a
                    key="delete"
                    style={{ color: 'red' }}
                    onClick={() => handleDelete(record.id)}
                >
                    삭제
                </a>,
            ],
        },
    ];

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '삭제 확인',
            content: '정말 삭제하시겠습니까?',
            onOk: async () => {
                const { error } = await supabase.from('dental_expenses').delete().eq('id', id);
                if (error) {
                    message.error('삭제 실패: ' + error.message);
                } else {
                    message.success('삭제되었습니다.');
                    actionRef.current?.reload();
                }
            },
        });
    };

    return (
        <PageContainer title="지출 관리" subTitle="병원 운영 지출 내역을 서버에 저장합니다.">
            <ProTable<ExpenseItem>
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                request={async (params, sorter, _filter) => {
                    let query = supabase.from('dental_expenses').select('*');

                    // Sort
                    if (sorter) {
                        const keys = Object.keys(sorter);
                        if (keys.length > 0) {
                            query = query.order(keys[0], { ascending: sorter[keys[0]] === 'ascend' });
                        }
                    } else {
                        query = query.order('date', { ascending: false });
                    }

                    // Search params
                    if (params.category) query = query.eq('category', params.category);
                    if (params.date) query = query.eq('date', params.date);

                    const { data, error } = await query;

                    if (error) {
                        message.error('데이터 로드 실패: ' + error.message);
                        return { data: [], success: false };
                    }

                    return {
                        data: data || [],
                        success: true,
                        total: data?.length || 0,
                    };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async (_key, record) => {
                        const { id, ...data } = record;
                        const { error } = await supabase.from('dental_expenses').update(data).eq('id', id);
                        if (error) throw error;
                    },
                }}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={async () => {
                            const { error } = await supabase.from('dental_expenses').insert([
                                { date: new Date().toISOString().split('T')[0], category: '기타', amount: 0, description: '새 지출' }
                            ]);
                            if (error) message.error(error.message);
                            else actionRef.current?.reload();
                        }}
                    >
                        지출 추가
                    </Button>,
                ]}
                pagination={{
                    pageSize: 10,
                }}
            />
        </PageContainer>
    );
};

export default Expenses;
