import React, { useEffect, useState } from 'react';
import { Card, Tag, Descriptions, Alert, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { supabase } from '../lib/supabase';

const SupabaseConnectionTest: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tableInfo, setTableInfo] = useState<any>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Supabase 연결 테스트 - dental_revenue 테이블 확인
                const { data, error: queryError } = await supabase
                    .from('dental_revenue')
                    .select('*')
                    .limit(1);

                if (queryError) {
                    throw queryError;
                }

                setConnected(true);
                setTableInfo({
                    tableName: 'dental_revenue',
                    recordCount: data?.length || 0,
                    firstRecord: data?.[0] || null,
                });
            } catch (err: any) {
                setConnected(false);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        testConnection();
    }, []);

    if (loading) {
        return (
            <Card title="Supabase 연결 테스트">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>연결 상태 확인 중...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Supabase 연결 테스트">
            {connected ? (
                <>
                    <Alert
                        message="연결 성공!"
                        description="Supabase와 정상적으로 연결되었습니다."
                        type="success"
                        icon={<CheckCircleOutlined />}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="상태">
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                연결됨
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Supabase URL">
                            {import.meta.env.VITE_SUPABASE_URL}
                        </Descriptions.Item>
                        <Descriptions.Item label="테이블 확인">
                            {tableInfo?.tableName}
                        </Descriptions.Item>
                        <Descriptions.Item label="데이터 레코드 수">
                            {tableInfo?.recordCount}개
                        </Descriptions.Item>
                        {tableInfo?.firstRecord && (
                            <Descriptions.Item label="샘플 데이터">
                                <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                                    {JSON.stringify(tableInfo.firstRecord, null, 2)}
                                </pre>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </>
            ) : (
                <>
                    <Alert
                        message="연결 실패"
                        description={error || '알 수 없는 오류가 발생했습니다.'}
                        type="error"
                        icon={<CloseCircleOutlined />}
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="상태">
                            <Tag color="red" icon={<CloseCircleOutlined />}>
                                연결 실패
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Supabase URL">
                            {import.meta.env.VITE_SUPABASE_URL || '설정되지 않음'}
                        </Descriptions.Item>
                        <Descriptions.Item label="에러 메시지">
                            <pre style={{ color: 'red', background: '#fff2f0', padding: 8, borderRadius: 4 }}>
                                {error}
                            </pre>
                        </Descriptions.Item>
                    </Descriptions>
                    <Alert
                        message="문제 해결 방법"
                        description={
                            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                                <li>Supabase 프로젝트가 활성화되어 있는지 확인하세요.</li>
                                <li>.env 파일의 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 올바른지 확인하세요.</li>
                                <li>dental_revenue 테이블이 생성되어 있는지 확인하세요.</li>
                                <li>Row Level Security (RLS) 정책이 올바르게 설정되어 있는지 확인하세요.</li>
                                <li>개발 서버를 재시작했는지 확인하세요 (환경 변수 변경 시 필요).</li>
                            </ul>
                        }
                        type="warning"
                        style={{ marginTop: 16 }}
                    />
                </>
            )}
        </Card>
    );
};

export default SupabaseConnectionTest;
