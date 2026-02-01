import React, { useState, useEffect } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Column, Pie } from '@ant-design/charts';
import { Row, Col, Statistic, Progress, Spin } from 'antd';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        insuranceRevenue: 0,
        nonInsuranceRevenue: 0,
        revenueHistory: [] as any[],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. 매출 데이터 가져오기
            const { data: revenueData } = await supabase.from('dental_revenue').select('*');
            // 2. 지출 데이터 가져오기
            const { data: expenseData } = await supabase.from('dental_expenses').select('*');

            if (revenueData && expenseData) {
                const totalRevenue = revenueData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
                const totalExpenses = expenseData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                const insuranceRevenue = revenueData.reduce((acc, curr) => acc + (Number(curr.co_payment) || 0), 0);
                const nonInsuranceRevenue = revenueData.reduce((acc, curr) => acc + (Number(curr.non_insurance) || 0), 0);

                // 연도별/월별 그룹화 (샘플로 연도별)
                const historyMap: Record<string, number> = {};
                revenueData.forEach(item => {
                    const year = item.date.split('-')[0];
                    historyMap[year] = (historyMap[year] || 0) + Number(item.total_amount);
                });

                const revenueHistory = Object.keys(historyMap).sort().map(year => ({
                    year,
                    value: historyMap[year],
                    type: 'Revenue'
                }));

                setStats({
                    totalRevenue,
                    totalExpenses,
                    insuranceRevenue,
                    nonInsuranceRevenue,
                    revenueHistory,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const configColumn = {
        data: stats.revenueHistory,
        xField: 'year',
        yField: 'value',
        seriesField: 'type',
        label: { position: 'middle', style: { fill: '#FFFFFF', opacity: 0.6 } },
    };

    const configPie = {
        appendPadding: 10,
        data: [
            { type: '보험 (본인부담)', value: stats.insuranceRevenue },
            { type: '비급여', value: stats.nonInsuranceRevenue },
        ],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'element-active' }],
    };

    // 준비도 점수 (간단히 수입 대비 지출 비율로 계산 - 예시)
    const readinessScore = Math.min(Math.round((stats.totalExpenses / (stats.totalRevenue || 1)) * 100), 100);

    return (
        <PageContainer title="대시보드" subTitle="실시간 서버 데이터 요약">
            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <ProCard
                            title="세무 준비 현황"
                            extra={new Date().getFullYear() + "년 현재"}
                            headerBordered
                            bordered
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <Statistic title="총 매출액" value={stats.totalRevenue} prefix="₩" />
                                <Statistic title="총 지출액" value={stats.totalExpenses} prefix="₩" />
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ marginBottom: 8, fontWeight: 'bold' }}>세무 준비 지수</div>
                                    <Progress percent={readinessScore} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                                </div>
                            </div>
                        </ProCard>
                    </Col>

                    <Col xs={24} lg={12}>
                        <ProCard title="연간 매출 성황" bordered headerBordered>
                            <Column {...configColumn} h={300} />
                        </ProCard>
                    </Col>

                    <Col xs={24} lg={12}>
                        <ProCard title="보험 vs 비급여 비중" bordered headerBordered>
                            <Pie {...configPie} h={300} />
                        </ProCard>
                    </Col>
                </Row>
            </Spin>
        </PageContainer>
    );
};

export default Dashboard;
