import React, { useState, useEffect } from 'react';
import { PageContainer, ProForm, ProFormText, ProFormDigit, ProCard, ProFormList } from '@ant-design/pro-components';
import { Tabs, Button, message, Space, Row, Col, Divider, Select, Modal } from 'antd';
import { SaveOutlined, PrinterOutlined, ZoomInOutlined, ZoomOutOutlined, CalendarOutlined, FileTextOutlined, AuditOutlined, MedicineBoxOutlined, SettingOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// --- CSS Styles for Government Document Remastering (2023 Revision) ---
const documentStyles = `
.doc-container {
    background: #525659;
    padding: 30px;
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    position: sticky;
    top: 0;
}
.doc-page {
    background: white;
    width: 210mm;
    min-height: 297mm;
    padding: 12mm 15mm;
    box-shadow: 0 0 25px rgba(0,0,0,0.4);
    font-family: "Nanum Myeongjo", "Batang", serif;
    color: #000;
    position: relative;
    line-height: 1.25;
    box-sizing: border-box;
    margin-bottom: 50px;
    transition: transform 0.2s ease;
}
.doc-header-info {
    font-size: 8pt;
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}
.doc-header-title {
    text-align: center;
    font-size: 20pt;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 10px 0 5px 0;
    font-family: "Malgun Gothic", sans-serif;
}
.doc-header-subtitle {
    text-align: center;
    font-size: 14pt;
    margin-bottom: 15px;
}
.doc-header-note {
    text-align: left;
    font-size: 7.5pt;
    margin-bottom: 5px;
}
.doc-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 0.61pt solid #000;
    font-size: 7.5pt;
}
.doc-table th, .doc-table td {
    border: 0.61pt solid #000;
    padding: 3px 4px;
    height: 22px;
    text-align: center;
    word-break: break-all;
    position: relative;
    transition: all 0.2s ease;
}
.doc-table th { background: #f4f4f4; font-weight: normal; font-size: 7pt; }
.doc-input-mimic {
    color: #1a4da3;
    font-weight: bold;
    font-family: "Malgun Gothic", sans-serif;
}
/* 하이라이트 효과 스타일 */
.doc-highlight {
    background-color: rgba(24, 144, 255, 0.15) !important;
    outline: 2px solid #1890ff !important;
    outline-offset: -2px;
    z-index: 10;
}
.doc-section-title {
    font-size: 9pt;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
    border-left: 3px solid #000;
    padding-left: 8px;
}
.doc-footer {
    margin-top: 30px;
    text-align: center;
    font-size: 9pt;
    line-height: 1.8;
}
.doc-unit { font-size: 7pt; float: right; margin-bottom: 2px; font-weight: normal; }
.doc-circle-num {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 0.5pt solid #000;
    border-radius: 50%;
    font-size: 7pt;
    line-height: 14px;
    text-align: center;
    margin-right: 2px;
}
@media print {
    body * { visibility: hidden; }
    .doc-page, .doc-page * { visibility: visible; }
    .doc-page { position: absolute; left: 0; top: 0; box-shadow: none; margin: 0; padding: 0; }
}
`;

const BusinessReport: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentYear = parseInt(searchParams.get('year') || '2024');
    const mainTab = searchParams.get('tab') || 'report';

    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(0.72);
    const [formValues, setFormValues] = useState<any>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isOptimizeMode, setIsOptimizeMode] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('user_hidden_fields');
        return saved ? JSON.parse(saved) : {};
    });
    const [form] = ProForm.useForm();

    const isFocused = (field: string) => focusedField === field ? 'doc-highlight' : '';
    const focusHandlers = (name: string) => ({
        onFocus: () => setFocusedField(name),
        onBlur: () => setFocusedField(null),
    });

    // 필드 최적화 토글 헬퍼
    const toggleFieldVisibility = (name: string) => {
        const newHidden = { ...hiddenFields, [name]: !hiddenFields[name] };
        setHiddenFields(newHidden);
        localStorage.setItem('user_hidden_fields', JSON.stringify(newHidden));
    };

    // 필드 래퍼 컴포넌트
    const FieldWrapper: React.FC<{ name: string; children: React.ReactNode; label?: string; layout?: 'row' | 'col' }> = ({ name, children }) => {
        const isHidden = hiddenFields[name];

        if (!isOptimizeMode && isHidden) return null;

        return (
            <div style={{
                position: 'relative',
                opacity: isHidden ? 0.4 : 1,
                border: isOptimizeMode ? '1px dashed #d9d9d9' : 'none',
                padding: isOptimizeMode ? '4px' : '0',
                marginBottom: isOptimizeMode ? '4px' : '0',
                borderRadius: '4px',
                transition: 'all 0.3s'
            }}>
                {isOptimizeMode && (
                    <div style={{
                        position: 'absolute', right: 0, top: -10, zIndex: 10,
                        background: isHidden ? '#ff4d4f' : '#1890ff',
                        color: 'white', fontSize: '10px', padding: '0 4px', cursor: 'pointer', borderRadius: '2px'
                    }} onClick={() => toggleFieldVisibility(name)}>
                        {isHidden ? '숨김됨' : '사용중'}
                    </div>
                )}
                {children}
            </div>
        );
    };

    const fetchAllData = async (year: number) => {
        setLoading(true);
        try {
            const { data: profile } = await supabase.from('hospital_profile').select('*').eq('id', 1).maybeSingle();
            const { data: report } = await supabase.from('business_status_report').select('*').eq('report_year', year).maybeSingle();

            const master: any = profile ? {
                bizName: profile.biz_name,
                bizNo: profile.biz_no,
                repName: profile.rep_name,
                address: profile.address,
                tel: profile.tel,
                phone: profile.phone,
                email: profile.email
            } : {
                bizName: '찬치과의원',
                bizNo: '616-93-18253',
                repName: '박찬',
                address: '제주특별자치도 제주시 중앙로371-1, 비 (이도이동,2층)',
                tel: '064-755-2228',
                phone: '',
                email: '',
                personNo: ''
            };

            if (report) {
                Object.assign(master,
                    report.business_info,
                    report.revenue_summary,
                    report.deduction_info,
                    report.facility_info
                );
            }

            const draftKey = `draft_${mainTab}_${year}`;
            const draftData = localStorage.getItem(draftKey);
            let finalData = master;

            if (draftData) {
                const parsedDraft = JSON.parse(draftData);
                finalData = { ...master, ...parsedDraft };
                message.info(`${year}년 작성 중이던 임시 데이터를 불러왔습니다.`, 2);
            }

            form.setFieldsValue(finalData);
            setFormValues(finalData);
        } catch (e) {
            console.error(e);
            message.error('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData(currentYear);
    }, [currentYear, mainTab]);

    const handleValuesChange = (changed: any, all: any) => {
        let updatedAll = { ...all };

        if (mainTab === 'report') {
            if ('revInc' in changed || 'revEx' in changed) {
                const total = (Number(all.revInc) || 0) + (Number(all.revEx) || 0);
                updatedAll.revTotal = total;
                form.setFieldsValue({ revTotal: total });
            }
            const buyFields = ['buyBillElec', 'buyBillPaper', 'buyBillBuyer', 'buyTaxElec', 'buyTaxPaper', 'buyTaxBuyer', 'buyCardCash'];
            if (buyFields.some(f => f in changed)) {
                const total = buyFields.reduce((sum, f) => sum + (Number(all[f]) || 0), 0);
                updatedAll.buyTotal = total;
                form.setFieldsValue({ buyTotal: total });
            }
        } else if (mainTab === 'review') {
            const revenueTypes = ['17', '18', '19', '20', '21', '22'];
            ['24', '25', '26'].forEach(rowNum => {
                if (revenueTypes.some(type => `${rowNum}_${type}` in changed)) {
                    const rowTotal = revenueTypes.reduce((sum, type) => sum + (Number(all[`${rowNum}_${type}`]) || 0), 0);
                    updatedAll[`${rowNum}_16`] = rowTotal;
                    form.setFieldsValue({ [`${rowNum}_16`]: rowTotal });
                }
            });
            ['16', ...revenueTypes].forEach(colType => {
                const row24 = Number(all[`24_${colType}`]) || 0;
                const row25 = Number(all[`25_${colType}`]) || 0;
                const row26 = Number(all[`26_${colType}`]) || 0;
                const colTotal = row24 - row25 + row26;
                updatedAll[`23_${colType}`] = colTotal;
                form.setFieldsValue({ [`23_${colType}`]: colTotal });
            });
        } else if (mainTab === 'review_sub') {
            // 재료 현황 자동 계산
            if (changed.materials) {
                const materials = [...(all.materials || [])];
                changed.materials.forEach((m: any, index: number) => {
                    if (m && ('mat_init' in m || 'mat_buy' in m || 'mat_used' in m)) {
                        const target = materials[index];
                        const total = (Number(target.mat_init) || 0) + (Number(target.mat_buy) || 0) - (Number(target.mat_used_amt) || 0);
                        target.mat_next = total;
                    }
                });
                updatedAll.materials = materials;
                form.setFieldsValue({ materials });
            }
        }

        setFormValues((prev: any) => {
            const newState = { ...prev, ...updatedAll };
            localStorage.setItem(`draft_${mainTab}_${currentYear}`, JSON.stringify(newState));
            return newState;
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const v = form.getFieldsValue();
            await Promise.all([
                supabase.from('hospital_profile').upsert({ id: 1, biz_name: v.bizName, biz_no: v.bizNo, rep_name: v.repName, address: v.address, tel: v.tel, phone: v.phone, email: v.email }),
                supabase.from('business_status_report').upsert({
                    report_year: currentYear,
                    business_info: {
                        bizName: v.bizName, bizNo: v.bizNo, repName: v.repName, personNo: v.personNo, address: v.address,
                        tel: v.tel, phone: v.phone, email: v.email, jointBiz: v.jointBiz, tel_home: v.tel_home, birth: v.birth
                    },
                    // ... data storage logic ...
                }, { onConflict: 'report_year' })
            ]);

            localStorage.removeItem(`draft_${mainTab}_${currentYear}`);
            message.success(`${currentYear}년 서류가 서버에 저장되었습니다.`);
        } catch (e: any) {
            message.error('오류: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const Form1Mock = () => (
        <div className="doc-page" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <div className="doc-header-info">
                <span>■ 소득세법 시행규칙 [별지 제19호서식] (2023.03.20 개정)</span>
                <span>전자신고 제출분</span>
            </div>
            <div className="doc-header-title">사 업 장 현 황 신 고 서</div>
            <div className="doc-header-note">※ 뒤쪽의 작성방법을 읽고 작성하시기 바라며, [ ]에는 해당되는 곳에 v표를 합니다. <span style={{ float: 'right' }}>(앞쪽)</span></div>

            <table className="doc-table">
                <tbody>
                    <tr><th style={{ width: '15%' }}>관리번호</th><td style={{ width: '35%' }}></td><th style={{ width: '20%' }}>처리기간</th><td>즉시</td></tr>
                    <tr><th>과세기간</th><td colSpan={3} className="doc-input-mimic">{currentYear} 년 01 월 01 일 ~ {currentYear} 년 12 월 31 일</td></tr>
                </tbody>
            </table>

            <table className="doc-table" style={{ marginTop: '-0px' }}>
                <tbody>
                    <tr><th rowSpan={3} style={{ width: '8%' }}>사업자</th><th style={{ width: '10%' }}>상 호</th><td style={{ width: '35%' }} className={`doc-input-mimic ${isFocused('bizName')}`}>{formValues.bizName}</td><th style={{ width: '15%' }}>사업자등록번호</th><td style={{ width: '17%' }} className={`doc-input-mimic ${isFocused('bizNo')}`}>{formValues.bizNo}</td><th style={{ width: '8%' }}>공동사업</th><td>[ ]여 [v]부</td></tr>
                    <tr><th>성 명</th><td className={`doc-input-mimic ${isFocused('repName')}`}>{formValues.repName}</td><th>주민등록번호</th><td colSpan={3} className={`doc-input-mimic ${isFocused('personNo')}`}>{formValues.personNo}</td></tr>
                    <tr><th>사업장소재지</th><td colSpan={3} className={`doc-input-mimic ${isFocused('address')}`}>{formValues.address}</td><th>전화번호</th><td className={`doc-input-mimic ${isFocused('tel')}`}>{formValues.tel}</td></tr>
                    <tr><th colSpan={2}>전 화 번 호</th><td className={`doc-input-mimic ${isFocused('tel_home')}`}>{formValues.tel_home}</td><th>휴대전화</th><td className={`doc-input-mimic ${isFocused('phone')}`}>{formValues.phone}</td><th>전자우편주소</th><td className={`doc-input-mimic ${isFocused('email')}`}>{formValues.email}</td></tr>
                </tbody>
            </table>

            <div className="doc-section-title">① 수입금액(매출액) 명세 <span className="doc-unit">(단위: 원)</span></div>
            <table className="doc-table">
                <thead><tr><th>업 태</th><th>종 목</th><th>업종코드</th><th>합 계</th><th>수입금액</th><th>수입금액 제외</th></tr></thead>
                <tbody>
                    <tr style={{ height: 28 }}><td>보건업</td><td>치과의원</td><td>851211</td><td className={`doc-input-mimic ${isFocused('revTotal')}`}>{formValues.revTotal?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('revInc')}`}>{formValues.revInc?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('revEx')}`}>{formValues.revEx?.toLocaleString()}</td></tr>
                    <tr style={{ height: 28 }}><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr style={{ height: 28 }}><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr style={{ height: 28 }}><th colSpan={3}>합 계</th><td className={`doc-input-mimic ${isFocused('revTotal')}`}>{formValues.revTotal?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('revInc')}`}>{formValues.revInc?.toLocaleString()}</td><td></td></tr>
                </tbody>
            </table>

            <div className="doc-section-title">② 수입금액(매출액) 구성 명세 <span className="doc-unit">(단위: 원)</span></div>
            <table className="doc-table">
                <thead>
                    <tr><th rowSpan={2}>합 계</th><th colSpan={2}>계산서발행금액</th><th colSpan={3}>계산서발행금액 이외 매출</th></tr>
                    <tr><th>계산서 발급분</th><th>매입자발행 계산서</th><th>신용카드 매출</th><th>현금영수증 매출</th><th>기타 매출</th></tr>
                </thead>
                <tbody>
                    <tr style={{ height: 35 }}>
                        <td className={`doc-input-mimic ${isFocused('revTotal')}`}>{formValues.revTotal?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('billOutNormal')}`}>{formValues.billOutNormal?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('billOutBuyer')}`}>{formValues.billOutBuyer?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('nonBillCard')}`}>{formValues.nonBillCard?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('nonBillCash')}`}>{formValues.nonBillCash?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('nonBillEtc')}`}>{formValues.nonBillEtc?.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div className="doc-section-title">③ 적격증빙(계산서 · 세금계산서 · 신용카드) 수취금액 <span className="doc-unit">(단위: 원)</span></div>
            <table className="doc-table">
                <thead>
                    <tr><th rowSpan={3}>합 계</th><th colSpan={3}>매입 계산서</th><th colSpan={3}>매입 세금계산서</th><th rowSpan={3}>신용카드 · 현금영수증<br />매입금액</th></tr>
                    <tr><th colSpan={2}>계산서 수취분</th><th rowSpan={2}>매입자발행<br />계산서</th><th colSpan={2}>세금계산서 수취분</th><th rowSpan={2}>매입자발행<br />세금계산서</th></tr>
                    <tr><th>전자계산서</th><th>전자계산서 외</th><th>전자세금계산서</th><th>전자세금계산서 외</th></tr>
                </thead>
                <tbody>
                    <tr style={{ height: 35 }}>
                        <td className={`doc-input-mimic ${isFocused('buyTotal')}`}>{formValues.buyTotal?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyBillElec')}`}>{formValues.buyBillElec?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyBillPaper')}`}>{formValues.buyBillPaper?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyBillBuyer')}`}>{formValues.buyBillBuyer?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyTaxElec')}`}>{formValues.buyTaxElec?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyTaxPaper')}`}>{formValues.buyTaxPaper?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyTaxBuyer')}`}>{formValues.buyTaxBuyer?.toLocaleString()}</td>
                        <td className={`doc-input-mimic ${isFocused('buyCardCash')}`}>{formValues.buyCardCash?.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <div className="doc-footer">
                신고인은 「소득세법」 제78조 및 같은 법 시행령 제141조에 따라 신고하며, <b>위 내용을 충분히 검토하였고 신고인이 알고 있는 사실 그대로를 정확하게 작성하였음을 확인합니다.</b><br /><br />
                <span className="doc-input-mimic">{currentYear + 1}</span> 년 02 월 11 일<br /><br />
                신 고 인 : <span className={`doc-input-mimic ${isFocused('repName')}`}>{formValues.repName}</span> (인 / 서명)<br /><br />
                <div style={{ fontSize: '18pt', fontWeight: 'bold', marginTop: '10px' }}>제주 세무서장 귀하</div>
            </div>
        </div>
    );

    const Form2Mock = () => (
        <div className="doc-page" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <div className="doc-header-title" style={{ fontSize: '18pt' }}>의료업자수입금액 검토표</div>
            <div className="doc-header-subtitle">( 일반병의원 · 한의원 공통 )</div>
            <div style={{ textAlign: 'right', fontSize: '8pt', marginBottom: 4 }}>(앞쪽)</div>

            <div className="doc-section-title">1. 기본사항</div>
            <table className="doc-table">
                <tbody>
                    <tr><th style={{ width: '20%' }}><span className="doc-circle-num">1</span>사업자등록번호</th><td style={{ width: '30%' }} className={`doc-input-mimic ${isFocused('bizNo')}`}>{formValues.bizNo}</td><th style={{ width: '15%' }}><span className="doc-circle-num">2</span>상호</th><td className={`doc-input-mimic ${isFocused('bizName')}`}>{formValues.bizName}</td><th style={{ width: '10%' }}><span className="doc-circle-num">3</span>성명</th><td className={`doc-input-mimic ${isFocused('repName')}`}>{formValues.repName}</td></tr>
                    <tr><th><span className="doc-circle-num">4</span>생년월일</th><td className={`doc-input-mimic ${isFocused('birth')}`}>{formValues.birth}</td><th><span className="doc-circle-num">5</span>병과</th><td className="doc-input-mimic">치과</td><th><span className="doc-circle-num">6</span>업종코드</th><td className="doc-input-mimic">851211</td></tr>
                </tbody>
            </table>

            <table className="doc-table" style={{ marginTop: 10 }}>
                <tbody>
                    <tr><th rowSpan={2} style={{ width: '10%' }}>사업장<br />시설</th><th style={{ width: '10%' }}><span className="doc-circle-num">7</span>진료실</th><td className={`doc-input-mimic ${isFocused('room_clinic')}`}>{formValues.room_clinic} m²</td><th style={{ width: '10%' }}><span className="doc-circle-num">8</span>수술실</th><td className={`doc-input-mimic ${isFocused('room_surgery')}`}>{formValues.room_surgery} m²</td><th style={{ width: '10%' }} rowSpan={2}>인원<br />현황</th><th style={{ width: '10%' }}><span className="doc-circle-num">12</span>고용의사</th><td className={`doc-input-mimic ${isFocused('staff_doctor')}`}>{formValues.staff_doctor} 명</td></tr>
                    <tr><th><span className="doc-circle-num">9</span>병실</th><td className={`doc-input-mimic ${isFocused('room_ward')}`}>{formValues.room_ward} m²</td><th><span className="doc-circle-num">11</span>대기실외</th><td className={`doc-input-mimic ${isFocused('room_wait')}`}>{formValues.room_wait} m²</td><th><span className="doc-circle-num">14</span>간호사</th><td className={`doc-input-mimic ${isFocused('staff_nurse')}`}>{formValues.staff_nurse} 명</td></tr>
                </tbody>
            </table>

            <div className="doc-section-title">2. 총수입금액 및 차이조정 명세 <span className="doc-unit">(단위: 원)</span></div>
            <table className="doc-table">
                <thead>
                    <tr><th rowSpan={2} style={{ width: '15%' }}>구 분</th><th colSpan={7}>당 해 과 세 기 간</th></tr>
                    <tr><th><span className="doc-circle-num">16</span>합계</th><th><span className="doc-circle-num">17</span>비보험</th><th><span className="doc-circle-num">18</span>건강보험</th><th><span className="doc-circle-num">19</span>손해보험</th><th><span className="doc-circle-num">20</span>의료급여</th><th><span className="doc-circle-num">21</span>유형자산양도</th><th><span className="doc-circle-num">22</span>기타수입</th></tr>
                </thead>
                <tbody>
                    <tr style={{ height: 30 }}><th><span className="doc-circle-num">23</span>합 계</th><td className={`doc-input-mimic ${isFocused('23_16')}`}>{formValues['23_16']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_17')}`}>{formValues['23_17']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_18')}`}>{formValues['23_18']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_19')}`}>{formValues['23_19']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_20')}`}>{formValues['23_20']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_21')}`}>{formValues['23_21']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('23_22')}`}>{formValues['23_22']?.toLocaleString()}</td></tr>
                    <tr style={{ height: 30 }}><th><span className="doc-circle-num">24</span>당해 수령</th><td className={`doc-input-mimic ${isFocused('24_16')}`}>{formValues['24_16']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_17')}`}>{formValues['24_17']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_18')}`}>{formValues['24_18']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_19')}`}>{formValues['24_19']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_20')}`}>{formValues['24_20']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_21')}`}>{formValues['24_21']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('24_22')}`}>{formValues['24_22']?.toLocaleString()}</td></tr>
                    <tr style={{ height: 30 }}><th><span className="doc-circle-num">25</span>직전 진료분</th><td className={`doc-input-mimic ${isFocused('25_16')}`}>{formValues['25_16']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_17')}`}>{formValues['25_17']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_18')}`}>{formValues['25_18']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_19')}`}>{formValues['25_19']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_20')}`}>{formValues['25_20']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_21')}`}>{formValues['25_21']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('25_22')}`}>{formValues['25_22']?.toLocaleString()}</td></tr>
                    <tr style={{ height: 30 }}><th><span className="doc-circle-num">26</span>당해 미수령</th><td className={`doc-input-mimic ${isFocused('26_16')}`}>{formValues['26_16']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_17')}`}>{formValues['26_17']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_18')}`}>{formValues['26_18']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_19')}`}>{formValues['26_19']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_20')}`}>{formValues['26_20']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_21')}`}>{formValues['26_21']?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('26_22')}`}>{formValues['26_22']?.toLocaleString()}</td></tr>
                </tbody>
            </table>

            <div className="doc-section-title">3. 의약품 등 사용검토 <span className="doc-unit">(단위: 원)</span></div>
            <table className="doc-table">
                <thead><tr><th style={{ width: '20%' }}>구 분</th><th><span className="doc-circle-num">27</span>전기이월액</th><th><span className="doc-circle-num">28</span>해당매입액</th><th><span className="doc-circle-num">29</span>사용액</th><th><span className="doc-circle-num">30</span>차기이월액</th></tr></thead>
                <tbody>
                    <tr style={{ height: 30 }}><th>치료의약품</th><td className={`doc-input-mimic ${isFocused('pharm_27')}`}>{formValues.pharm_27?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('pharm_28')}`}>{formValues.pharm_28?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('pharm_29')}`}>{formValues.pharm_29?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('pharm_30')}`}>{formValues.pharm_30?.toLocaleString()}</td></tr>
                    <tr style={{ height: 30 }}><th>의료소모품</th><td className={`doc-input-mimic ${isFocused('supp_27')}`}>{formValues.supp_27?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('supp_28')}`}>{formValues.supp_28?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('supp_29')}`}>{formValues.supp_29?.toLocaleString()}</td><td className={`doc-input-mimic ${isFocused('supp_30')}`}>{formValues.supp_30?.toLocaleString()}</td></tr>
                </tbody>
            </table>

            <div className="doc-footer" style={{ marginTop: 30 }}>
                <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>제주 세무서장 귀하</div>
            </div>
        </div>
    );

    const Form3Mock = () => (
        <div className="doc-page" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
            <div className="doc-header-title" style={{ fontSize: '18pt' }}>치과병·의원 수입금액검토부표</div>

            <div className="doc-section-title">(1) 인적사항</div>
            <table className="doc-table">
                <tbody>
                    <tr><th style={{ width: '10%' }}><span className="doc-circle-num">1</span>상호</th><td className={`doc-input-mimic ${isFocused('bizName')}`}>{formValues.bizName}</td><th style={{ width: '10%' }}><span className="doc-circle-num">2</span>성명</th><td className={`doc-input-mimic ${isFocused('repName')}`}>{formValues.repName}</td><th style={{ width: '15%' }}><span className="doc-circle-num">3</span>생년월일</th><td className={`doc-input-mimic ${isFocused('birth')}`}>{formValues.birth}</td></tr>
                </tbody>
            </table>

            <div className="doc-section-title">(2) 주요의료기기 현황 (고가순으로) <span className="doc-unit">(단위: 대, 원)</span></div>
            <table className="doc-table">
                <thead><tr><th colSpan={2}>구분</th><th rowSpan={2} style={{ width: '10%' }}><span className="doc-circle-num">5</span>대수</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">6</span>취득일</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">7</span>취득가액</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">8</span>리스일</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">9</span>리스가가액</th></tr><tr><th style={{ width: '8%' }}>코드</th><th><span className="doc-circle-num">4</span>명칭</th></tr></thead>
                <tbody>
                    {(formValues.devices || Array(4).fill({})).map((d: any, i: number) => (
                        <tr key={i} style={{ height: 28 }}>
                            <td className={isFocused(`devices_${i}_code`)}>{d.code}</td>
                            <td className={`doc-input-mimic ${isFocused(`devices_${i}_name`)}`}>{d.name}</td>
                            <td className="doc-input-mimic">{d.count}</td>
                            <td className={`doc-input-mimic ${isFocused(`devices_${i}_date`)}`}>{d.date}</td>
                            <td className={`doc-input-mimic ${isFocused(`devices_${i}_price`)}`}>{d.price?.toLocaleString()}</td>
                            <td className={`doc-input-mimic ${isFocused(`devices_${i}_lease_date`)}`}>{d.lease_date}</td>
                            <td className="doc-input-mimic">{d.lease_price?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="doc-section-title">(3) 진료유형별 비보험 수입금액 (고액순으로) <span className="doc-unit">(단위: 명, 원)</span></div>
            <table className="doc-table">
                <thead><tr><th colSpan={2}>구분</th><th colSpan={2}>당해 과세기간</th><th colSpan={2}>구분</th><th colSpan={2}>당해 과세기간</th></tr><tr><th style={{ width: '8%' }}>코드</th><th><span className="doc-circle-num">10</span>유형</th><th style={{ width: '10%' }}><span className="doc-circle-num">11</span>인원</th><th style={{ width: '20%' }}><span className="doc-circle-num">12</span>수입금액</th><th style={{ width: '8%' }}>코드</th><th>유형</th><th style={{ width: '10%' }}>인원</th><th style={{ width: '20%' }}>수입금액</th></tr></thead>
                <tbody>
                    {[0, 1, 2, 3, 4].map(idx => (
                        <tr key={idx} style={{ height: 28 }}>
                            <td className={isFocused(`non_ins_${idx}_code`)}>{(formValues.non_ins || [])[idx]?.code}</td>
                            <td className={`doc-input-mimic ${isFocused(`non_ins_${idx}_type`)}`}>{(formValues.non_ins || [])[idx]?.type}</td>
                            <td className="doc-input-mimic">{(formValues.non_ins || [])[idx]?.count}</td>
                            <td className={`doc-input-mimic ${isFocused(`non_ins_${idx}_amt`)}`}>{(formValues.non_ins || [])[idx]?.amt?.toLocaleString()}</td>

                            <td className={isFocused(`non_ins_${idx + 5}_code`)}>{(formValues.non_ins || [])[idx + 5]?.code}</td>
                            <td className={`doc-input-mimic ${isFocused(`non_ins_${idx + 5}_type`)}`}>{(formValues.non_ins || [])[idx + 5]?.type}</td>
                            <td className="doc-input-mimic">{(formValues.non_ins || [])[idx + 5]?.count}</td>
                            <td className={`doc-input-mimic ${isFocused(`non_ins_${idx + 5}_amt`)}`}>{(formValues.non_ins || [])[idx + 5]?.amt?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="doc-section-title">(4) 주요사용재료 현황 <span className="doc-unit">(단위: 개, 세트, 원)</span></div>
            <table className="doc-table">
                <thead><tr><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">13</span>종류</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">14</span>전기이월액</th><th colSpan={3}>당해 과세기간</th><th rowSpan={2} style={{ width: '15%' }}><span className="doc-circle-num">18</span>차기이월액</th></tr><tr><th><span className="doc-circle-num">15</span>매입금액</th><th><span className="doc-circle-num">16</span>사용량</th><th><span className="doc-circle-num">17</span>사용금액</th></tr></thead>
                <tbody>
                    {(formValues.materials || Array(3).fill({})).map((m: any, i: number) => (
                        <tr key={i} style={{ height: 30 }}>
                            <th className={`doc-input-mimic ${isFocused(`materials_${i}_name`)}`} style={{ background: '#fcfcfc' }}>{m.name}</th>
                            <td className={`doc-input-mimic ${isFocused(`materials_${i}_init`)}`}>{m.mat_init?.toLocaleString()}</td>
                            <td className={`doc-input-mimic ${isFocused(`materials_${i}_buy`)}`}>{m.mat_buy?.toLocaleString()}</td>
                            <td className="doc-input-mimic">{m.mat_use_count}</td>
                            <td className={`doc-input-mimic ${isFocused(`materials_${i}_used_amt`)}`}>{m.mat_used_amt?.toLocaleString()}</td>
                            <td className={`doc-input-mimic ${isFocused(`materials_${i}_next`)}`}>{m.mat_next?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const RevenueGridInput = () => {
        const rows = [{ id: '24', label: '당해 수령' }, { id: '25', label: '직전 진료분' }, { id: '26', label: '당해 미수령' }];
        const cols = [{ id: '17', label: '비보험' }, { id: '18', label: '건강보험' }, { id: '19', label: '손해보험' }, { id: '20', label: '의료급여' }, { id: '21', label: '유형자산' }, { id: '22', label: '기타수입' }];
        return (
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                    <thead><tr><th style={{ border: '1px solid #d9d9d9', padding: 4 }}>구분</th><th style={{ border: '1px solid #d9d9d9', padding: 4, background: '#fafafa' }}>합계(자동)</th>{cols.map(c => <th key={c.id} style={{ border: '1px solid #d9d9d9', padding: 4 }}>{c.label}</th>)}</tr></thead>
                    <tbody>
                        {rows.map(r => (
                            <tr key={r.id}>
                                <th style={{ border: '1px solid #d9d9d9', padding: 4, textAlign: 'left' }}>{r.label}</th>
                                <td style={{ border: '1px solid #d9d9d9' }}>
                                    <FieldWrapper name={`${r.id}_16`}>
                                        <ProFormDigit name={`${r.id}_16`} noStyle fieldProps={{ ...focusHandlers(`${r.id}_16`), readOnly: true, variant: 'borderless', style: { textAlign: 'right', fontWeight: 'bold' } }} />
                                    </FieldWrapper>
                                </td>
                                {cols.map(c => (
                                    <td key={c.id} style={{ border: '1px solid #d9d9d9' }}>
                                        <FieldWrapper name={`${r.id}_${c.id}`}>
                                            <ProFormDigit name={`${r.id}_${c.id}`} noStyle fieldProps={{ ...focusHandlers(`${r.id}_${c.id}`), variant: 'borderless', style: { textAlign: 'right' } }} />
                                        </FieldWrapper>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr style={{ background: '#fafafa' }}>
                            <th style={{ border: '1px solid #d9d9d9', padding: 4, textAlign: 'left' }}>합계 (자동)</th>
                            <td style={{ border: '1px solid #d9d9d9' }}>
                                <FieldWrapper name="23_16">
                                    <ProFormDigit name="23_16" noStyle fieldProps={{ ...focusHandlers('23_16'), readOnly: true, variant: 'borderless', style: { textAlign: 'right', fontWeight: 'bold', color: '#1890ff' } }} />
                                </FieldWrapper>
                            </td>
                            {cols.map(c => (
                                <td key={c.id} style={{ border: '1px solid #d9d9d9' }}>
                                    <FieldWrapper name={`23_${c.id}`}>
                                        <ProFormDigit name={`23_${c.id}`} noStyle fieldProps={{ ...focusHandlers(`23_${c.id}`), readOnly: true, variant: 'borderless', style: { textAlign: 'right', fontWeight: 'bold' } }} />
                                    </FieldWrapper>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <PageContainer title={`사업장현황신고 시스템 (${currentYear})`} extra={[
            <Tabs
                key="main"
                activeKey={mainTab}
                onChange={(k) => setSearchParams({ year: currentYear.toString(), tab: k })}
                items={[
                    { key: 'report', label: <Space><FileTextOutlined />사업장현황신고서</Space> },
                    { key: 'review', label: <Space><AuditOutlined />수입금액검토표</Space> },
                    { key: 'review_sub', label: <Space><MedicineBoxOutlined />치과검토부표</Space> },
                ]}
                style={{ marginRight: 24 }}
            />,
            <Space key="zoom"><Button icon={<ZoomOutOutlined />} onClick={() => setZoom(z => z - 0.05)} /><Button icon={<ZoomInOutlined />} onClick={() => setZoom(z => z + 0.05)} /></Space>,
            <Select
                key="year"
                prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                value={currentYear}
                onChange={(y) => setSearchParams({ year: y.toString(), tab: mainTab })}
                style={{ width: 120 }}
                options={[2022, 2023, 2024, 2025].map(y => ({ label: `${y}년`, value: y }))}
            />,
            <Button key="profile" icon={<SettingOutlined />} onClick={() => setIsProfileModalOpen(true)}>병원정보</Button>,
            <Button key="s" type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>서류 저장 및 동기화</Button>,
            <Button key="p" icon={<PrinterOutlined />} onClick={() => window.print()}>인쇄</Button>,
            <Button
                key="optimize"
                type={isOptimizeMode ? "primary" : "default"}
                danger={isOptimizeMode}
                icon={<SaveOutlined />}
                onClick={() => setIsOptimizeMode(!isOptimizeMode)}
                style={{ marginLeft: 8 }}
            >
                {isOptimizeMode ? "최적화 완료" : "입력창 최적화"}
            </Button>
        ]}>
            <style>{documentStyles}</style>
            <Row gutter={20}>
                <Col span={9}>
                    <ProForm form={form} submitter={false} onValuesChange={handleValuesChange}>
                        {mainTab === 'report' ? (
                            <Tabs type="card" items={[
                                {
                                    key: '1',
                                    label: '① 수입금액',
                                    children: (
                                        <ProCard bordered size="small">
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="revTotal"><ProFormDigit name="revTotal" label="합계 (자동)" fieldProps={{ ...focusHandlers('revTotal'), readOnly: true }} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="revInc"><ProFormDigit name="revInc" label="수입금액" fieldProps={focusHandlers('revInc')} /></FieldWrapper></Col>
                                            </Row>
                                            <FieldWrapper name="revEx"><ProFormDigit name="revEx" label="수입금액 제외" fieldProps={focusHandlers('revEx')} /></FieldWrapper>
                                        </ProCard>
                                    )
                                },
                                {
                                    key: '2',
                                    label: '② 구성명세',
                                    children: (
                                        <ProCard bordered size="small">
                                            <Divider orientation="left" plain>계산서 발행</Divider>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="billOutNormal"><ProFormDigit name="billOutNormal" label="계산서 발급분" fieldProps={focusHandlers('billOutNormal')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="billOutBuyer"><ProFormDigit name="billOutBuyer" label="매입자발행" fieldProps={focusHandlers('billOutBuyer')} /></FieldWrapper></Col>
                                            </Row>
                                            <Divider orientation="left" plain>계산서 이외 매출</Divider>
                                            <Row gutter={8}>
                                                <Col span={8}><FieldWrapper name="nonBillCard"><ProFormDigit name="nonBillCard" label="신용카드" fieldProps={focusHandlers('nonBillCard')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="nonBillCash"><ProFormDigit name="nonBillCash" label="현금영수증" fieldProps={focusHandlers('nonBillCash')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="nonBillEtc"><ProFormDigit name="nonBillEtc" label="기타" fieldProps={focusHandlers('nonBillEtc')} /></FieldWrapper></Col>
                                            </Row>
                                        </ProCard>
                                    )
                                },
                                {
                                    key: '3',
                                    label: '③ 수취금액',
                                    children: (
                                        <ProCard bordered size="small">
                                            <FieldWrapper name="buyTotal"><ProFormDigit name="buyTotal" label="매입 합계 (자동)" fieldProps={{ ...focusHandlers('buyTotal'), readOnly: true }} /></FieldWrapper>
                                            <Divider orientation="left" plain>매입 계산서</Divider>
                                            <Row gutter={8}>
                                                <Col span={8}><FieldWrapper name="buyBillElec"><ProFormDigit name="buyBillElec" label="전자" fieldProps={focusHandlers('buyBillElec')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="buyBillPaper"><ProFormDigit name="buyBillPaper" label="종이" fieldProps={focusHandlers('buyBillPaper')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="buyBillBuyer"><ProFormDigit name="buyBillBuyer" label="매입자발행" fieldProps={focusHandlers('buyBillBuyer')} /></FieldWrapper></Col>
                                            </Row>
                                            <Divider orientation="left" plain>매입 세금계산서</Divider>
                                            <Row gutter={8}>
                                                <Col span={8}><FieldWrapper name="buyTaxElec"><ProFormDigit name="buyTaxElec" label="전자" fieldProps={focusHandlers('buyTaxElec')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="buyTaxPaper"><ProFormDigit name="buyTaxPaper" label="종이" fieldProps={focusHandlers('buyTaxPaper')} /></FieldWrapper></Col>
                                                <Col span={8}><FieldWrapper name="buyTaxBuyer"><ProFormDigit name="buyTaxBuyer" label="매입자발행" fieldProps={focusHandlers('buyTaxBuyer')} /></FieldWrapper></Col>
                                            </Row>
                                            <Divider />
                                            <FieldWrapper name="buyCardCash"><ProFormDigit name="buyCardCash" label="신용카드/현금영수증" fieldProps={focusHandlers('buyCardCash')} /></FieldWrapper>
                                        </ProCard>
                                    )
                                }
                            ]} />
                        ) : mainTab === 'review' ? (
                            <Tabs type="card" items={[
                                {
                                    key: 'base', label: '1. 기본/시설',
                                    children: (
                                        <ProCard bordered size="small">
                                            <FieldWrapper name="birth"><ProFormText name="birth" label="생년월일" fieldProps={focusHandlers('birth')} /></FieldWrapper>
                                            <Divider orientation="left" plain>사업장 시설 (m²)</Divider>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="room_clinic"><ProFormDigit name="room_clinic" label="진료실" fieldProps={focusHandlers('room_clinic')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="room_surgery"><ProFormDigit name="room_surgery" label="수술실" fieldProps={focusHandlers('room_surgery')} /></FieldWrapper></Col>
                                            </Row>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="room_ward"><ProFormDigit name="room_ward" label="병실" fieldProps={focusHandlers('room_ward')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="room_wait"><ProFormDigit name="room_wait" label="대기실외" fieldProps={focusHandlers('room_wait')} /></FieldWrapper></Col>
                                            </Row>
                                            <Divider orientation="left" plain>인원 현황 (명)</Divider>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="staff_doctor"><ProFormDigit name="staff_doctor" label="고용의사" fieldProps={focusHandlers('staff_doctor')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="staff_nurse"><ProFormDigit name="staff_nurse" label="간호사" fieldProps={focusHandlers('staff_nurse')} /></FieldWrapper></Col>
                                            </Row>
                                        </ProCard>
                                    )
                                },
                                {
                                    key: 'rev', label: '2. 수입명세',
                                    children: (
                                        <ProCard bordered size="small">
                                            <div style={{ marginBottom: 16, fontSize: '9pt', fontWeight: 'bold', color: '#1890ff' }}>※ 종이 서류 양식과 동일한 그리드 입력</div>
                                            <RevenueGridInput />
                                        </ProCard>
                                    )
                                },
                                {
                                    key: 'med', label: '3. 의약품/소모품',
                                    children: (
                                        <ProCard bordered size="small">
                                            <Divider orientation="left" plain>치료의약품</Divider>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="pharm_27"><ProFormDigit name="pharm_27" label="전기이월" fieldProps={focusHandlers('pharm_27')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="pharm_28"><ProFormDigit name="pharm_28" label="해당매입" fieldProps={focusHandlers('pharm_28')} /></FieldWrapper></Col>
                                            </Row>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="pharm_29"><ProFormDigit name="pharm_29" label="사용액" fieldProps={focusHandlers('pharm_29')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="pharm_30"><ProFormDigit name="pharm_30" label="차기이월" fieldProps={focusHandlers('pharm_30')} /></FieldWrapper></Col>
                                            </Row>
                                            <Divider orientation="left" plain>의료소모품</Divider>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="supp_27"><ProFormDigit name="supp_27" label="전기이월" fieldProps={focusHandlers('supp_27')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="supp_28"><ProFormDigit name="supp_28" label="해당매입" fieldProps={focusHandlers('supp_28')} /></FieldWrapper></Col>
                                            </Row>
                                            <Row gutter={8}>
                                                <Col span={12}><FieldWrapper name="supp_29"><ProFormDigit name="supp_29" label="사용액" fieldProps={focusHandlers('supp_29')} /></FieldWrapper></Col>
                                                <Col span={12}><FieldWrapper name="supp_30"><ProFormDigit name="supp_30" label="차기이월" fieldProps={focusHandlers('supp_30')} /></FieldWrapper></Col>
                                            </Row>
                                        </ProCard>
                                    )
                                }
                            ]} />
                        ) : (
                            <Tabs type="card" items={[
                                {
                                    key: 'dev', label: '주요 의료기기', children: (
                                        <ProCard bordered size="small">
                                            <div style={{ marginBottom: 12, fontSize: '8pt', color: '#888' }}>※ 입력 시 서류의 해당 행이 하이라이트됩니다.</div>
                                            <ProFormList name="devices" initialValue={[{}, {}, {}, {}]}>
                                                {(_, index) => (
                                                    <div style={{ marginBottom: 16 }}>
                                                        <Row gutter={8}>
                                                            <Col span={4}><FieldWrapper name={`devices_${index}_code`}><ProFormText name="code" label="코드" fieldProps={focusHandlers(`devices_${index}_code`)} /></FieldWrapper></Col>
                                                            <Col span={8}><FieldWrapper name={`devices_${index}_name`}><ProFormText name="name" label="명칭" fieldProps={focusHandlers(`devices_${index}_name`)} /></FieldWrapper></Col>
                                                            <Col span={12}><FieldWrapper name={`devices_${index}_price`}><ProFormDigit name="price" label="취득가액" fieldProps={focusHandlers(`devices_${index}_price`)} /></FieldWrapper></Col>
                                                        </Row>
                                                        <Row gutter={8}>
                                                            <Col span={12}><FieldWrapper name={`devices_${index}_date`}><ProFormText name="date" label="취득일" placeholder="YYYY-MM-DD" fieldProps={focusHandlers(`devices_${index}_date`)} /></FieldWrapper></Col>
                                                            <Col span={12}><FieldWrapper name={`devices_${index}_lease_date`}><ProFormText name="lease_date" label="리스일" placeholder="YYYY-MM-DD" fieldProps={focusHandlers(`devices_${index}_lease_date`)} /></FieldWrapper></Col>
                                                        </Row>
                                                        <Divider dashed style={{ margin: '8px 0' }} />
                                                    </div>
                                                )}
                                            </ProFormList>
                                        </ProCard>
                                    )
                                },
                                {
                                    key: 'non', label: '비보험 수입', children: (
                                        <ProCard bordered size="small">
                                            <ProFormList name="non_ins" initialValue={[{}, {}, {}, {}, {}]}>
                                                {(_, index) => (
                                                    <Row gutter={8}>
                                                        <Col span={4}><FieldWrapper name={`non_ins_${index}_code`}><ProFormText name="code" label="코드" fieldProps={focusHandlers(`non_ins_${index}_code`)} /></FieldWrapper></Col>
                                                        <Col span={10}><FieldWrapper name={`non_ins_${index}_type`}><ProFormText name="type" label="진료유형" fieldProps={focusHandlers(`non_ins_${index}_type`)} /></FieldWrapper></Col>
                                                        <Col span={10}><FieldWrapper name={`non_ins_${index}_amt`}><ProFormDigit name="amt" label="수입금액" fieldProps={focusHandlers(`non_ins_${index}_amt`)} /></FieldWrapper></Col>
                                                    </Row>
                                                )}
                                            </ProFormList>
                                        </ProCard>
                                    )
                                },
                                {
                                    key: 'mat', label: '사용재료', children: (
                                        <ProCard bordered size="small">
                                            <ProFormList name="materials" initialValue={[{ name: '임플란트' }, { name: '교정용 브리켓' }, { name: '금(골드)' }]}>
                                                {(_, index) => (
                                                    <div style={{ marginBottom: 16 }}>
                                                        <FieldWrapper name={`materials_${index}_name`}><ProFormText name="name" label="재료종류" fieldProps={focusHandlers(`materials_${index}_name`)} /></FieldWrapper>
                                                        <Row gutter={8}>
                                                            <Col span={12}><FieldWrapper name={`materials_${index}_init`}><ProFormDigit name="mat_init" label="전기이월액" fieldProps={focusHandlers(`materials_${index}_init`)} /></FieldWrapper></Col>
                                                            <Col span={12}><FieldWrapper name={`materials_${index}_buy`}><ProFormDigit name="mat_buy" label="매입금액" fieldProps={focusHandlers(`materials_${index}_buy`)} /></FieldWrapper></Col>
                                                        </Row>
                                                        <Row gutter={8}>
                                                            <Col span={12}><FieldWrapper name={`materials_${index}_used_amt`}><ProFormDigit name="mat_used_amt" label="사용금액" fieldProps={focusHandlers(`materials_${index}_used_amt`)} /></FieldWrapper></Col>
                                                            <Col span={12}><FieldWrapper name={`materials_${index}_next`}><ProFormDigit name="mat_next" label="차기이월(자동)" fieldProps={{ readOnly: true, style: { background: '#f5f5f5' }, ...focusHandlers(`materials_${index}_next`) }} /></FieldWrapper></Col>
                                                        </Row>
                                                        <Divider dashed style={{ margin: '8px 0' }} />
                                                    </div>
                                                )}
                                            </ProFormList>
                                        </ProCard>
                                    )
                                }
                            ]} />
                        )}
                    </ProForm>
                </Col>
                <Col span={15}><div className="doc-container">{mainTab === 'report' ? <Form1Mock /> : mainTab === 'review' ? <Form2Mock /> : <Form3Mock />}</div></Col>
            </Row>

            {/* 기본정보 수정 모달 */}
            <Modal
                title="병원 기본정보 관리"
                open={isProfileModalOpen}
                onCancel={() => setIsProfileModalOpen(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsProfileModalOpen(false)}>확인</Button>
                ]}
                width={700}
            >
                <div style={{ marginTop: 20 }}>
                    <ProForm
                        form={form}
                        submitter={false}
                        onValuesChange={(changed, all) => handleValuesChange(changed, all)}
                    >
                        <Row gutter={16}>
                            <Col span={12}><ProFormText name="bizName" label="상호" fieldProps={focusHandlers('bizName')} /></Col>
                            <Col span={12}><ProFormText name="bizNo" label="사업자등록번호" fieldProps={focusHandlers('bizNo')} /></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><ProFormText name="repName" label="성명" fieldProps={focusHandlers('repName')} /></Col>
                            <Col span={12}><ProFormText name="personNo" label="주민등록번호" fieldProps={focusHandlers('personNo')} /></Col>
                        </Row>
                        <ProFormText name="address" label="사업장소재지" fieldProps={focusHandlers('address')} />
                        <Row gutter={16}>
                            <Col span={12}><ProFormText name="tel" label="사업장전화" fieldProps={focusHandlers('tel')} /></Col>
                            <Col span={12}><ProFormText name="phone" label="휴대전화" fieldProps={focusHandlers('phone')} /></Col>
                        </Row>
                    </ProForm>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: 10 }}>
                        ※ 여기서 수정하는 정보는 서류 프리뷰에 즉시 반영되며, '서류 저장' 시 함께 저장됩니다.
                    </div>
                </div>
            </Modal>
        </PageContainer>
    );
};

export default BusinessReport;
