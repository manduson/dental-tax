
import React, { useState } from 'react';
import { PageContainer, ModalForm, ProFormMoney, ProFormDatePicker } from '@ant-design/pro-components';
import { Upload, message, Card, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Dragger } = Upload;
// const { Title, Text } = Typography;

const UploadPage: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<any>({});

    const mockOCR = (file: File) => {
        console.log("Analyzing file:", file.name);
        setLoading(true);
        setTimeout(() => {
            // Mock parsed data
            const data = {
                date: dayjs().format('YYYY-MM-DD'),
                total_amount: 1250000,
                co_payment: 350000,
                non_insurance: 150000,
                collected_amount: 1100000,
                card: 800000,
                cash: 300000,
                uncollected: 150000,
            };
            setParsedData(data);
            setLoading(false);
            setModalVisible(true);
            message.success('OCR Processing Complete');
        }, 2000);
    };

    const props: UploadProps = {
        name: 'file',
        multiple: false,
        customRequest: ({ file, onSuccess }) => {
            mockOCR(file as File);
            onSuccess?.("ok");
        },
        onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(`${info.file.name} file uploaded successfully.`);
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    return (
        <PageContainer title="Upload Screenshot">
            <Card title="Upload Dentweb Screenshot" bordered={false}>
                <Dragger {...props} disabled={loading}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                        banned files.
                    </p>
                </Dragger>
                {loading && <div style={{ textAlign: 'center', marginTop: 16 }}><Spin tip="Analyzing Image..." /></div>}
            </Card>

            <ModalForm
                title="Confirm Extracted Data"
                open={modalVisible}
                onOpenChange={setModalVisible}
                initialValues={parsedData}
                modalProps={{
                    destroyOnClose: true
                }}
                onFinish={async (values) => {
                    console.log('Confirmed:', values);
                    message.success('Data Saved Successfully');
                    return true;
                }}
            >
                <ProFormDatePicker name="date" label="Date" width="md" rules={[{ required: true }]} />
                <ProFormMoney name="total_amount" label="Total Medical Expenses (진료비총액)" rules={[{ required: true }]} />
                <ProFormMoney name="co_payment" label="Co-payment (본인부담금)" rules={[{ required: true }]} />
                <ProFormMoney name="non_insurance" label="Non-insurance (비보험)" rules={[{ required: true }]} />
                <ProFormMoney name="collected_amount" label="Collected Amount (수납액)" rules={[{ required: true }]} />
                <ProFormMoney name="card" label="Card (카드)" rules={[{ required: true }]} />
                <ProFormMoney name="cash" label="Cash (현금)" rules={[{ required: true }]} />
                <ProFormMoney name="uncollected" label="Uncollected (미수금)" rules={[{ required: true }]} />
            </ModalForm>
        </PageContainer>
    );
};

export default UploadPage;
