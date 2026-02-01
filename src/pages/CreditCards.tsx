import React, { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Button, Space, Row, Col, Modal, Form, Input, InputNumber, message, Spin, Tooltip, Select, Tag, Divider } from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, HolderOutlined,
    InfoCircleOutlined, SyncOutlined, MobileOutlined,
    HomeOutlined, SafetyOutlined, ThunderboltOutlined, PlaySquareOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCardNumber } from '../utils/cardUtils';
import { supabase } from '../lib/supabase';

// DND Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type CreditCardItem = {
    id: string;
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    annualFee: number;
    benefits: string;
    usage: string[];
    notes: string;
    sort_order: number;
    payment_date: number | null;
    min_performance: string;
    discount_target: string;
    discount_limit: string;
    discount_exclude: string;
    performance_exclude: string;
    recurring_payments: string[]; // 정기결제 배열 추가
};

// 정기결제 아이콘 매핑 함수
const getRecurringIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('통신') || n.includes('폰') || n.includes('모바일')) return <MobileOutlined />;
    if (n.includes('관리비') || n.includes('아파트')) return <HomeOutlined />;
    if (n.includes('보험')) return <SafetyOutlined />;
    if (n.includes('전기')) return <ThunderboltOutlined />;
    if (n.includes('구독') || n.includes('넷플릭스') || n.includes('유튜브')) return <PlaySquareOutlined />;
    return <SyncOutlined />; // 기본 아이콘
};

// 정렬 가능한 카드 컴포넌트
const SortableCard = ({ card, handleEdit, handleDelete, renderLink, expiryStatus, formatExpiry }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
        height: '100%',
    };

    return (
        <Col xs={24} sm={12} md={8} lg={6} xl={6} ref={setNodeRef} style={style}>
            <Card
                hoverable
                size="small"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div {...listeners} {...attributes} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#ccc' }}>
                            <HolderOutlined />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                            {card.cardName}
                        </div>
                    </div>
                }
                extra={
                    <Space size={2}>
                        <Button type="text" size="small" icon={<EditOutlined style={{ fontSize: 12 }} />} onClick={() => handleEdit(card)} />
                        <Button type="text" size="small" danger icon={<DeleteOutlined style={{ fontSize: 12 }} />} onClick={() => handleDelete(card.id)} />
                    </Space>
                }
                style={{ height: '100%', fontSize: 12 }}
                bodyStyle={{ padding: '8px 12px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ color: '#888', fontFamily: 'monospace' }}>{card.cardNumber || '****'}</div>
                    <div style={{ color: '#555', fontWeight: 600 }}>
                        {card.annualFee === 0 ? <span style={{ color: 'green' }}>Free</span> : `₩${(card.annualFee / 10000)}만`}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarOutlined style={{ color: '#ccc' }} />
                            <span style={{ color: expiryStatus.color, fontWeight: expiryStatus.bold ? 700 : 400 }}>
                                {formatExpiry(card.expiryDate)} {expiryStatus.icon}
                            </span>
                        </div>
                        {card.payment_date && (
                            <Tag color="orange" style={{ fontSize: 10, margin: 0, fontWeight: 'bold' }}>
                                {card.payment_date}일 결제
                            </Tag>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: 6 }}>
                    <div style={{ color: '#1890ff', fontWeight: 'bold', marginBottom: 2 }}>혜택</div>
                    <Tooltip title={card.benefits}>
                        <div style={{ color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {card.benefits || '-'}
                        </div>
                    </Tooltip>
                </div>

                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>사용처</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {card.usage && card.usage.length > 0 ? (
                            card.usage.map((tag: string, index: number) => (
                                <Tag key={index} color="blue" style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
                                    {tag}
                                </Tag>
                            ))
                        ) : (
                            <span style={{ color: '#ccc' }}>-</span>
                        )}
                    </div>
                </div>

                <div style={{ background: '#f9f9f9', padding: '6px 8px', borderRadius: 4, marginBottom: 8 }}>
                    <Row gutter={[4, 4]} style={{ fontSize: 11 }}>
                        <Col span={12}><span style={{ color: '#888' }}>실적:</span> {card.min_performance || '-'}</Col>
                        <Col span={12}><span style={{ color: '#888' }}>한도:</span> {card.discount_limit || '-'}</Col>
                        <Col span={24}><span style={{ color: '#888' }}>할인처:</span> {card.discount_target || '-'}</Col>
                    </Row>
                </div>

                {/* 정기결제 항목 (Badge Style) */}
                {card.recurring_payments && card.recurring_payments.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: '#722ed1', fontWeight: 'bold', marginBottom: 4 }}>자동이체</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {card.recurring_payments.map((item: string, idx: number) => (
                                <Tag key={idx} icon={getRecurringIcon(item)} style={{ fontSize: 10, margin: 0, borderRadius: 10, background: '#f9f0ff', color: '#722ed1', border: '1px solid #d3adf7' }}>
                                    {item}
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}

                {(card.discount_exclude || card.performance_exclude) && (
                    <div style={{ marginBottom: 6, fontSize: 11 }}>
                        <Tooltip title={
                            <div>
                                {card.discount_exclude && <div><strong>할인제외:</strong> {card.discount_exclude}</div>}
                                {card.performance_exclude && <div style={{ marginTop: 4 }}><strong>실적제외:</strong> {card.performance_exclude}</div>}
                            </div>
                        }>
                            <Space size={4} style={{ cursor: 'help', color: '#faad14' }}>
                                <InfoCircleOutlined style={{ fontSize: 12 }} />
                                <span>할인/실적 제외 조건 확인</span>
                            </Space>
                        </Tooltip>
                    </div>
                )}

                {(card.notes) && (
                    <div style={{ background: '#fafafa', padding: 4, borderRadius: 4 }}>
                        <div style={{ color: '#888', fontSize: 11, lineHeight: 1.2, height: 26, overflow: 'hidden' }}>
                            {renderLink(card.notes)}
                        </div>
                    </div>
                )}
            </Card>
        </Col>
    );
};

const CreditCards: React.FC = () => {
    const [dataSource, setDataSource] = useState<CreditCardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null);
    const [form] = Form.useForm();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchCards = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('dental_credit_cards')
                .select('*')
                .order('sort_order', { ascending: true });

            if (data) {
                const mappedData: CreditCardItem[] = data.map((item: any) => ({
                    id: item.id,
                    cardName: item.card_name,
                    cardNumber: item.card_number,
                    expiryDate: item.expiry_date,
                    annualFee: item.annual_fee,
                    benefits: item.benefits,
                    usage: item.usage ? item.usage.split(',').filter((s: string) => s.trim() !== '') : [],
                    notes: item.url ? `${item.notes || ''}\n${item.url}` : item.notes,
                    sort_order: item.sort_order || 0,
                    payment_date: item.payment_date,
                    min_performance: item.min_performance || '',
                    discount_target: item.discount_target || '',
                    discount_limit: item.discount_limit || '',
                    discount_exclude: item.discount_exclude || '',
                    performance_exclude: item.performance_exclude || '',
                    recurring_payments: item.recurring_payments ? item.recurring_payments.split(',').filter((s: string) => s.trim() !== '') : [],
                }));
                setDataSource(mappedData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCards(); }, []);

    const formatExpiry = (dateStr: string) => {
        if (!dateStr) return '-';
        return dayjs(dateStr).format('MM/YY');
    };

    const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        let formatted = val;
        if (val.length > 2) formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
        form.setFieldsValue({ expiryText: formatted });
    };

    const checkExpiryStatus = (dateStr: string) => {
        if (!dateStr) return { color: '#666', icon: null };
        const expiry = dayjs(dateStr).endOf('month');
        const diff = expiry.diff(dayjs(), 'day');
        if (diff < 0) return { color: '#ff4d4f', icon: '❌', bold: true };
        if (diff < 90) return { color: '#faad14', icon: '⚠️', bold: true };
        return { color: '#666', icon: null, bold: false };
    };

    const handleAdd = () => { setEditingCard(null); form.resetFields(); setIsModalOpen(true); };
    const handleEdit = (card: CreditCardItem) => {
        setEditingCard(card);
        const expiryText = card.expiryDate ? dayjs(card.expiryDate).format('MM/YY') : '';
        form.setFieldsValue({ ...card, expiryText });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: '삭제 확인',
            content: '이 카드를 삭제하시겠습니까?',
            okType: 'danger',
            onOk: async () => {
                await supabase.from('dental_credit_cards').delete().eq('id', id);
                message.success('삭제되었습니다.');
                fetchCards();
            }
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let expiryDate = null;
            if (values.expiryText && values.expiryText.length === 5) {
                const [month, year] = values.expiryText.split('/');
                expiryDate = `20${year}-${month}-01`;
            }

            const payload = {
                card_name: values.cardName,
                card_number: values.cardNumber,
                expiry_date: expiryDate,
                annual_fee: values.annualFee,
                benefits: values.benefits,
                usage: Array.isArray(values.usage) ? values.usage.join(',') : values.usage,
                notes: values.notes,
                status: 'active',
                payment_date: values.payment_date,
                min_performance: values.min_performance,
                discount_target: values.discount_target,
                discount_limit: values.discount_limit,
                discount_exclude: values.discount_exclude,
                performance_exclude: values.performance_exclude,
                recurring_payments: Array.isArray(values.recurring_payments) ? values.recurring_payments.join(',') : values.recurring_payments,
            };

            if (editingCard) {
                await supabase.from('dental_credit_cards').update(payload).eq('id', editingCard.id);
                message.success('수정되었습니다.');
            } else {
                const maxOrder = dataSource.length > 0 ? Math.max(...dataSource.map(c => c.sort_order)) : 0;
                await supabase.from('dental_credit_cards').insert([{ ...payload, sort_order: maxOrder + 1 }]);
                message.success('추가되었습니다.');
            }
            setIsModalOpen(false);
            fetchCards();
        } catch (error) { }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setDataSource((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                updateServerOrder(newItems);
                return newItems;
            });
        }
    };

    const updateServerOrder = async (newItems: CreditCardItem[]) => {
        const updates = newItems.map((item, index) => ({ id: item.id, sort_order: index }));
        for (const update of updates) {
            await supabase.from('dental_credit_cards').update({ sort_order: update.sort_order }).eq('id', update.id);
        }
        message.success('순서가 저장되었습니다.', 0.5);
    };

    const renderLink = (text: string) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
        return text.split(urlRegex).map((part, i) =>
            urlRegex.test(part) ? <a key={i} href={part.startsWith('www') ? `http://${part}` : part} target="_blank" rel="noreferrer">{part}</a> : part
        );
    };

    return (
        <PageContainer
            title="신용카드"
            subTitle="카드를 관리하고 드래그하여 순서를 변경하세요"
            extra={[<Button key="add" type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}>카드 추가</Button>]}
        >
            <Spin spinning={loading}>
                {!loading && dataSource.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        <p>등록된 카드가 없습니다.</p>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={dataSource.map(i => i.id)} strategy={rectSortingStrategy}>
                            <Row gutter={[12, 12]}>
                                {dataSource.map((card) => (
                                    <SortableCard
                                        key={card.id}
                                        card={card}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        renderLink={renderLink}
                                        expiryStatus={checkExpiryStatus(card.expiryDate)}
                                        formatExpiry={formatExpiry}
                                    />
                                ))}
                            </Row>
                        </SortableContext>
                    </DndContext>
                )}
            </Spin>

            <Modal title="카드 정보" open={isModalOpen} onOk={handleModalOk} onCancel={() => setIsModalOpen(false)} destroyOnClose width={550} okText={editingCard ? "수정" : "등록"} cancelText="취소">
                <Form form={form} layout="vertical" size="small">
                    <Row gutter={16}>
                        <Col span={14}>
                            <Form.Item name="cardName" label="카드명" rules={[{ required: true, message: '카드명을 입력해주세요' }]}>
                                <Input placeholder="예: 삼성 아멕스" />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item name="cardNumber" label="카드번호">
                                <Input placeholder="**** ****" onChange={(e) => form.setFieldsValue({ cardNumber: formatCardNumber(e.target.value) })} maxLength={19} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={8}>
                        <Col span={8}>
                            <Form.Item name="expiryText" label="만료일(MM/YY)" rules={[{ pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: '형식 오류' }]}>
                                <Input placeholder="0927" maxLength={5} onChange={handleExpiryInput} style={{ textAlign: 'center' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="payment_date" label="결제일" rules={[{ type: 'number', min: 1, max: 31, message: '1-31' }]}>
                                <InputNumber style={{ width: '100%' }} placeholder="예: 14" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="annualFee" label="연회비">
                                <InputNumber style={{ width: '100%' }} formatter={v => `₩ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v!.replace(/\D/g, '')} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '8px 0' }} />

                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="min_performance" label="전월실적">
                                <Input placeholder="예: 30만원 이상" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="discount_limit" label="할인한도">
                                <Input placeholder="예: 월 2만원" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="discount_target" label="할인처">
                                <Input placeholder="예: 카페, 편의점, 주유소 등" />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="recurring_payments" label="정기결제 (자동이체)" tooltip="통신비, 관리비 등 자동이체 항목을 입력 후 엔터를 누르세요.">
                                <Select mode="tags" style={{ width: '100%' }} placeholder="예: 통신비, 관리비 (엔터 입력)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={8}>
                        <Col span={12}>
                            <Form.Item name="discount_exclude" label="할인제외">
                                <Input placeholder="예: 무이자할부, 세금 등" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="performance_exclude" label="실적제외">
                                <Input placeholder="예: 상품권, 대학등록금 등" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '8px 0' }} />

                    <Form.Item name="benefits" label="요약 혜택"><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="usage" label="사용처 (태그)">
                        <Select mode="tags" style={{ width: '100%' }} placeholder="예: 식비, 병원비 (엔터 입력)" tokenSeparators={[',']} />
                    </Form.Item>
                    <Form.Item name="notes" label="비고"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default CreditCards;
