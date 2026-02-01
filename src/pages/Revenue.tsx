import React, { useRef } from 'react';
import { PageContainer, ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import { Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { supabase } from '../lib/supabase';

type RevenueItem = {
    id: string;
    date: string;
    total_amount: number;
    co_payment: number;
    non_insurance: number;
    collected_amount: number;
    card: number;
    cash: number;
    uncollected: number;
};

const Revenue: React.FC = () => {
    const actionRef = useRef<ActionType>();

    const columns: ProColumns<RevenueItem>[] = [
        {
            title: '날짜',
            dataIndex: 'date',
            valueType: 'date',
            sorter: true,
            fixed: 'left',
            width: 120,
        },
        {
            title: '총 매출',
            dataIndex: 'total_amount',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '본인부담금',
            dataIndex: 'co_payment',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '비급여',
            dataIndex: 'non_insurance',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '수납액',
            dataIndex: 'collected_amount',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '카드',
            dataIndex: 'card',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '현금',
            dataIndex: 'cash',
            valueType: 'money',
            align: 'right',
        },
        {
            title: '미수금',
            dataIndex: 'uncollected',
            valueType: 'money',
            align: 'right',
            render: (_, record) => (
                <span style={{ color: record.uncollected > 0 ? 'red' : 'inherit', fontWeight: record.uncollected > 0 ? 'bold' : 'normal' }}>
                    {record.uncollected.toLocaleString()}
                </span>
            ),
        },
        {
            title: '작업',
            valueType: 'option',
            fixed: 'right',
            width: 120,
            render: (text, record, _, action) => [
                <a key="edit" onClick={() => action?.startEditable?.(record.id)}>수정</a>,
                <a key="delete" style={{ color: 'red' }} onClick={() => handleDelete(record.id)}>삭제</a>,
            ],
        },
    ];

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '삭제 확인',
            content: '정말 삭제하시겠습니까?',
            onOk: async () => {
                const { error } = await supabase.from('dental_revenue').delete().eq('id', id);
                if (error) message.error(error.message);
                else {
                    message.success('삭제되었습니다.');
                    actionRef.current?.reload();
                }
            },
        });
    };

    return (
        <PageContainer title="매출 관리" subTitle="일일 매출 데이터를 서버에 저장하고 관리합니다.">
            <ProTable<RevenueItem>
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                request={async (params, sorter) => {
                    let query = supabase.from('dental_revenue').select('*');

                    if (sorter) {
                        const keys = Object.keys(sorter);
                        if (keys.length > 0) query = query.order(keys[0], { ascending: sorter[keys[0]] === 'ascend' });
                    } else {
                        query = query.order('date', { ascending: false });
                    }

                    if (params.date) query = query.eq('date', params.date);

                    const { data, error } = await query;
                    return { data: data || [], success: !error, total: data?.length || 0 };
                }}
                editable={{
                    type: 'multiple',
                    onSave: async (key, record) => {
                        const { id, ...data } = record;
                        const { error } = await supabase.from('dental_revenue').update(data).eq('id', id);
                        if (error) throw error;
                    },
                }}
                toolBarRender={() => [
                    <Button
                        key="add"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={async () => {
                            const { error } = await supabase.from('dental_revenue').insert([{
                                date: dayjs().format('YYYY-MM-DD'),
                                total_amount: 0,
                                co_payment: 0,
                                non_insurance: 0,
                                collected_amount: 0,
                                card: 0,
                                cash: 0,
                                uncollected: 0
                            }]);
                            if (error) message.error(error.message);
                            else actionRef.current?.reload();
                        }}
                    >
                        매출 추가
                    </Button>,
                ]}
            />
        </PageContainer>
    );
};

export default Revenue;
