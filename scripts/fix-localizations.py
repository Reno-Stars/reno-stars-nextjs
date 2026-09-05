#!/usr/bin/env python3
"""Fix empty localizations in blog drafts."""
import json, os, sys

os.chdir('/workspace/reno-stars-nextjs')

# Localizations template for all 14 non-en/zh locales
# Based on actual draft content themes
LOCALIZATIONS = {
    # Delta bathroom
    "bathroom-renovation-cost-delta-bc-2026": {
        "titleKo": "델타 BC 욕실 리노베이션 비용 (2026): 실제 데이터",
        "metaDescriptionKo": "델타 BC 2026 욕실 리노베이션 비용 가이드. 실제 Reno Stars 프로젝트 데이터 기반.",
        "titleJa": "デルタ BC バスrenching 비용 (2026): 実際のデータ",
        "metaDescriptionJa": "デルタ BC 2026 バスrenching 비용 가이드. 実際のプロジェクトデータ.",
        "titleHi": "डेल्टा BC बाथरूम रेनोवेशन लागत 2026: वास्तविक डेटा",
        "metaDescriptionHi": "डेल्टा BC 2026 बाथरूम रेनोवेशन लागत गाइड. Reno Stars वास्तविक डेटा.",
        "titleAr": "تكلفة تجديد الحمام في دلتا BC 2026: بيانات حقيقية",
        "metaDescriptionAr": "دليل تكلفة تجديد الحمام في دلتا BC 2026. بيانات حقيقية من مشاريع Reno Stars.",
        "titleFr": "Coût de rénovation de salle de bain Delta BC 2026 — Données réelles",
        "metaDescriptionFr": "Guide des coûts de rénovation salle de bain Delta BC 2026. Données de projets réels Reno Stars.",
        "titleEs": "Costo de renovación de baño en Delta BC 2026: Datos reales",
        "metaDescriptionEs": "Guía de costos de renovación de baño Delta BC 2026. Datos de proyectos reales Reno Stars.",
        "titleTh": "ค่าใช้จ่ายตกแต่งห้องน้ำ Delta BC 2026",
        "metaDescriptionTh": "คู่มือค่าใช้จ่ายตกแต่งห้องน้ำ Delta BC 2026 ข้อมูลจริงจากโครงการ Reno Stars",
        "titleVi": "Chi phí cải tạo nhà vệ sinh Delta BC 2026: Dữ liệu thực tế",
        "metaDescriptionVi": "Hướng dẫn chi phí cải tạo nhà vệ sinh Delta BC 2026. Dữ liệu dự án thực tế Reno Stars.",
        "titleTl": "Gastos sa Pagpapaayos ng Banyo sa Delta BC 2026: Real na Datos",
        "metaDescriptionTl": "Gabay sa gastos sa pagpapaayos ng banyo Delta BC 2026. Real na datos mula sa mga proyekto ng Reno Stars.",
        "titleId": "Biaya Renovasi Kamar Mandi Delta BC 2026: Data Nyata",
        "metaDescriptionId": "Panduan biaya renovasi kamar mandi Delta BC 2026. Data proyek nyata Reno Stars.",
        "titleMs": "Kos Pembaikan Bilik Mandi Delta BC 2026: Data Sebenar",
        "metaDescriptionMs": "Panduan kos pembaikan bilik mandi Delta BC 2026. Data projek sebenar Reno Stars.",
        "titleZhHant": "Delta浴室裝修費用（2026）：真實項目數據",
        "metaDescriptionZhHant": "Delta BC浴室裝修費用2026指南。來自Reno Stars真實項目數據。",
    },
    # Commercial renovation
    "commercial-renovation-cost-vancouver-2026": {
        "titleKo": "밴쿠버 상업용 리노베이션 비용 2026: 실제 데이터",
        "metaDescriptionKo": "밴쿠버 2026년 상업용 리노베이션 비용 가이드. 사무실, 소매, 레스토랑, 클리닉 실제 데이터.",
        "titleJa": "バンクーバー商業装修費用 2026：実際のプロジェクトデータ",
        "metaDescriptionJa": "バンクーバー2026年商業装修費用ガイド。オフィス、小売、レストランの実データ。",
        "titleHi": "वैंकूवर वाणिवेश रेनोवेशन लागत 2026: वास्तविक डेटा",
        "metaDescriptionHi": "वैंकूवर 2026 वाणिवेश रेनोवेशन लागत गाइड. कार्यालय, खुद्रा, रेस्तरां, क्लीनिक डेटा.",
        "titleAr": "تكلفة تجديد التجارية في فانكوفر 2026: بيانات حقيقية",
        "metaDescriptionAr": "دليل تكلفة تجديد التجارية في فانكوفر 2026. بيانات مكاتب، متاجر، مطاعم، عيادات.",
        "titleFr": "Coût de rénovation commerciale Vancouver 2026 — Données réelles",
        "metaDescriptionFr": "Guide des coûts de rénovation commerciale Vancouver 2026. Bureaux, commerces, restaurants, cliniques.",
        "titleEs": "Costo de renovación comercial Vancouver 2026: Datos reales",
        "metaDescriptionEs": "Guía de costos de renovación comercial Vancouver 2026. Oficinas, comercios, restaurantes, clínicas.",
        "titleTh": "ค่าใช้จ่ายตกแต่งพาณิชยกรรมแวนคูเวอร์ 2026",
        "metaDescriptionTh": "ค่าใช้จ่ายตกแต่งพาณิชยกรรมแวนคูเวอร์ 2026 ข้อมูลจริงจากโครงการ Reno Stars",
        "titleVi": "Chi phí cải tạo thương mại Vancouver 2026: Dữ liệu thực tế",
        "metaDescriptionVi": "Hướng dẫn chi phí cải tạo thương mại Vancouver 2026. Văn phòng, bán lẻ, nhà hàng, phòng khám.",
        "titleTl": "Gastos sa Komersiyal na Pagpapaayos sa Vancouver 2026: Real na Datos",
        "metaDescriptionTl": "Gabay sa gastos sa komersiyal na pagpapaayos Vancouver 2026. Opisina, tingi, restawran, klinika.",
        "titleId": "Biaya Renovasi Komersial Vancouver 2026: Data Nyata",
        "metaDescriptionId": "Panduan biaya renovasi komersial Vancouver 2026. Kantor, ritel, restoran, klinik.",
        "titleMs": "Kos Pembaikan Komersial Vancouver 2026: Data Sebenar",
        "metaDescriptionMs": "Panduan kos pembaikan komersial Vancouver 2026. Pejabat, runcit, restoran, klinik.",
        "titleZhHant": "溫哥華商業裝修費用（2026）：真實項目數據",
        "metaDescriptionZhHant": "溫哥華2026年商業裝修費用指南。辦公室、零售、餐廳、診所真實數據。",
    },
    # Heat pump
    "heat-pump-installation-bc-hydro-rebates-2026": {
        "titleKo": "BC 히트 펌프 설치 2026: BC Hydro 리베이트, 비용 및 허가 가이드",
        "metaDescriptionKo": "BC 히트 펌프 설치 2026: 최대 $10,000 BC Hydro 리베이트 포함 완전 가이드.",
        "titleJa": "バンクーバー熱泵設置 2026: BC Hydro リベート、費用、許可ガイド",
        "metaDescriptionJa": "BC熱泵設置2026：BC Hydroリベート最大$10,000含む完全ガイド。",
        "titleHi": "BC हीट पंप स्थापना 2026: BC Hydro रिबेट, लागत और अनुमति गाइड",
        "metaDescriptionHi": "BC हीट पंप स्थापना 2026: $10,000 तक BC Hydro रिबेट सहित पूर्ण गाइड.",
        "titleAr": "تركيب مضخة الحرارة BC 2026: BC Hydro والمصاريف والرسوم",
        "metaDescriptionAr": "دليل تركيب مضخة الحرارة BC 2026 مع Rebate تصل إلى $10,000.",
        "titleFr": "Installation de pompe à chaleur BC 2026: Guide des rabais BC Hydro",
        "metaDescriptionFr": "Installation pompe à chaleur BC 2026: rabais BC Hydro jusqu'à 10 000 $ inclus.",
        "titleEs": "Instalación de bomba de calor BC 2026: Guía de reembolsos BC Hydro",
        "metaDescriptionEs": "Instalación bomba de calor BC 2026: reembolsos BC Hydro hasta $10,000 incluidos.",
        "titleTh": "การติดตั้งปั๊มความร้อน BC 2026: คู่มือ BC Hydro Rebate",
        "metaDescriptionTh": "การติดตั้งปั๊มความร้อน BC 2026: คู่มือ Rebate สูงสุด $10,000",
        "titleVi": "Lắp đặt bơm nhiệt BC 2026: Hướng dẫn BC Hydro Rebate",
        "metaDescriptionVi": "Lắp đặt bơm nhiệt BC 2026: Hướng dẫn BC Hydro Rebate lên đến $10,000.",
        "titleTl": "Pag-install ng Heat Pump sa BC 2026: Gabay sa BC Hydro Rebate",
        "metaDescriptionTl": "Pag-install ng heat pump BC 2026: Gabay na may BC Hydro Rebate hanggang $10,000.",
        "titleId": "Instalasi Pompa Panas BC 2026: Panduan BC Hydro Rebate",
        "metaDescriptionId": "Instalasi pompa panas BC 2026: Panduan dengan BC Hydro Rebate hingga $10,000.",
        "titleMs": "Pemasangan Pam Haba BC 2026: Panduan BC Hydro Rebate",
        "metaDescriptionMs": "Pemasangan pam haba BC 2026: Panduan BC Hydro Rebate sehingga $10,000.",
        "titleZhHant": "BC省熱泵安裝（2026）：BC水電局補貼、費用及許可指南",
        "metaDescriptionZhHant": "BC省熱泵安裝2026：BC水電局補貼高達$10,000的完整指南。",
    },
    # Poly-B
    "poly-b-pipe-replacement-vancouver-2026": {
        "titleKo": "밴쿠버 Poly-B 배관 교체 2026: 비용, 위험 및 주의사항",
        "metaDescriptionKo": "밴쿠버 및 Metro Vancouver Poly-B 배관 교체 2026 완전 가이드. 비용, 위험, 보험.",
        "titleJa": "バンクーバー POLY-B 管 取替え 2026: 費用、リスク、ガイド",
        "metaDescriptionJa": "バンクーバーPOLY-B管取替え2026完全ガイド。費用、リスク、ガイド。",
        "titleHi": "वैंकूवर Poly-B पाइप प्रतिस्थापन 2026: लागत, जोखिम और जानकारी",
        "metaDescriptionHi": "वैंकूवर Poly-B पाइप प्रतिस्थापन 2026 पूर्ण गाइड। लागत, जोखिम, बीमा.",
        "titleAr": "استبدال أنابيب Poly-B في فانكوفر 2026: التكاليف والمخاطر",
        "metaDescriptionAr": "دليل شامل لاستبدال أنابيب Poly-B في فانكوفر 2026. التكاليف والمخاطر والتأمين.",
        "titleFr": "Remplacement tuyaux Poly-B Vancouver 2026: Coûts, risques et assurance",
        "metaDescriptionFr": "Guide complet remplacement tuyaux Poly-B Vancouver 2026. Coûts, risques, assurance.",
        "titleEs": "Reemplazo de tuberías Poly-B Vancouver 2026: Costos y riesgos",
        "metaDescriptionEs": "Guía completa reemplazo de tuberías Poly-B Vancouver 2026. Costos, riesgos, seguro.",
        "titleTh": "การเปลี่ยนท่อ Poly-B ในแวนคูเวอร์ 2026",
        "metaDescriptionTh": "คู่มือการเปลี่ยนท่อ Poly-B ในแวนคูเวอร์ 2026 ค่าใช้จ่าย ความเสี่ยง ประกัน",
        "titleVi": "Thay thế ống Poly-B Vancouver 2026: Chi phí và rủi ro",
        "metaDescriptionVi": "Hướng dẫn thay thế ống Poly-B Vancouver 2026. Chi phí, rủi ro, bảo hiểm.",
        "titleTl": "Pagpapalit ng Poly-B Pipe sa Vancouver 2026: Gastos at Risk",
        "metaDescriptionTl": " Gabay sa pagpapalit ng Poly-B pipe Vancouver 2026. Gastos, risk, insurance.",
        "titleId": "Penggantian Pipa Poly-B Vancouver 2026: Biaya dan Risiko",
        "metaDescriptionId": "Panduan lengkap penggantian pipa Poly-B Vancouver 2026. Biaya, risiko, asuransi.",
        "titleMs": "Pertukaran Paip Poly-B Vancouver 2026: Kos dan Risiko",
        "metaDescriptionMs": "Panduan lengkap pertukaran paip Poly-B Vancouver 2026. Kos, risiko, insurans.",
        "titleZhHant": "溫哥華Poly-B管道更換（2026）：費用、風險及須知",
        "metaDescriptionZhHant": "溫哥華及大溫地區Poly-B管道更換2026完整指南。費用、風險、保險。",
    },
    # Renovation deposit
    "renovation-deposit-bc-guide": {
        "titleKo": "BC 리노베이션 계약금 가이드 2026: 정상 금액과 위험 신호",
        "metaDescriptionKo": "BC 리노베이션 계약금 2026: 정상 금액, 위험 신호 및 보호 방법.",
        "titleJa": "バンクーバー リノベーション デポジット BC 2026: 正常金額と危険信号",
        "metaDescriptionJa": "BCリノベーションデポジット2026：正常金額、危険信号、保護方法。",
        "titleHi": "BC रेनोवेशन जमा राशि गाइड 2026: सामान्य और खतरे के संकेत",
        "metaDescriptionHi": "BC रेनोवेशन जमा राशि 2026: सामान्य राशि, खतरे के संकेत, सुरक्षा.",
        "titleAr": "دليل إيداع التجديد في CB 2026: ما هو طبيعي وما هو علامة تحذير",
        "metaDescriptionAr": "دليل إيداع التجديد في CB 2026: المبلغ الطبيعي، علامات التحذير، الحماية.",
        "titleFr": "Guide du dépôt de rénovation BC 2026: Ce qui est normal et les signaux d'alarme",
        "metaDescriptionFr": "Guide du dépôt de rénovation BC 2026. Montant normal, signaux d'alarme, protection.",
        "titleEs": "Guía de depósito de renovación BC 2026: Lo normal y las señales de alerta",
        "metaDescriptionEs": "Guía de depósito de renovación BC 2026. Monto normal, alertas, protección.",
        "titleTh": "คู่มือเงินมัดจำตกแต่ง BC 2026: ปกติและสัญญาณเตือน",
        "metaDescriptionTh": "คู่มือเงินมัดจำตกแต่ง BC 2026: ปกติ สัญญาณเตือน วิธีป้องกัน",
        "titleVi": "Hướng dẫn tiền đặt cọc cải tạo BC 2026: Bình thường và cờ đỏ",
        "metaDescriptionVi": "Hướng dẫn tiền đặt cọc cải tạo BC 2026. Bình thường, cờ đỏ, bảo vệ.",
        "titleTl": "Gabay sa Deposit ng Renovation BC 2026: Normal at Red Flag",
        "metaDescriptionTl": "Gabay sa deposit ng renovation BC 2026. Normal na halaga, red flag, proteksyon.",
        "titleId": "Panduan Deposit Renovasi BC 2026: Normal dan Tanda Bahaya",
        "metaDescriptionId": "Panduan deposit renovasi BC 2026. Jumlah normal, tanda bahaya, perlindungan.",
        "titleMs": "Panduan Deposit Pembaikan BC 2026: Biasa dan Tanda Bahaya",
        "metaDescriptionMs": "Panduan deposit pembaikan BC 2026. Amaun biasa, tanda bahaya, perlindungan.",
        "titleZhHant": "BC裝修定金指南（2026）：正常金額與危險信號",
        "metaDescriptionZhHant": "BC裝修定金2026：正常金額標準與危險信號自保方法。",
    },
    # Renovation insurance claims
    "renovation-insurance-claims-bc-2026": {
        "titleKo": "BC 리노베이션 보험 청구 가이드 2026: 절차와 권리",
        "metaDescriptionKo": "BC 리노베이션 보험 청구 2026: 절차, 보험 적용 범위 및 권리 가이드.",
        "titleJa": "バンクーバー リノベーション保険クレーム BC 2026: 完全ガイド",
        "metaDescriptionJa": "BCリノベージュ保険クレーム2026：手順、適用範囲、権利の完全ガイド。",
        "titleHi": "BC रेनोवेशन बीमा दावा गाइड 2026: प्रक्रिया और अधिकार",
        "metaDescriptionHi": "BC रेनोवेशन बीमा दावा 2026: प्रक्रिया, कवरेज और अधिकार गाइड.",
        "titleAr": "دليل مطالبة تأمين التجديد في كولومبيا البريطانية 2026",
        "metaDescriptionAr": "دليل مطالبة تأمين التجديد في كولومبيا البريطانية 2026: الإجراءات والحقوق والتغطية.",
        "titleFr": "Guide des réclamations d'assurance rénovation BC 2026",
        "metaDescriptionFr": "Guide des réclamations d'assurance rénovation BC 2026. Procédure, couverture, droits.",
        "titleEs": "Guía de reclamaciones de seguro de renovación BC 2026",
        "metaDescriptionEs": "Guía de reclamaciones de seguro de renovación BC 2026. Procedimiento, cobertura, derechos.",
        "titleTh": "คู่มือการเรียกร้องประกันการตกแต่ง BC 2026",
        "metaDescriptionTh": "คู่มือการเรียกร้องประกันการตกแต่ง BC 2026 ขั้นตอน ความครอบคลุม สิทธิ์",
        "titleVi": "Hướng dẫn yêu cầu bảo hiểm cải tạo BC 2026",
        "metaDescriptionVi": "Hướng dẫn yêu cầu bảo hiểm cải tạo BC 2026. Thủ tục, phạm vi, quyền.",
        "titleTl": "Gabay sa Insurance Claim ng Renovation BC 2026",
        "metaDescriptionTl": "Gabay sa insurance claim ng renovation BC 2026. Proseso, coverage, karapatan.",
        "titleId": "Panduan Klaim Asuransi Renovasi BC 2026",
        "metaDescriptionId": "Panduan klaim asuransi renovasi BC 2026. Prosedur, cakupan, hak.",
        "titleMs": "Panduan Tuntutan Insurans Pembaikan BC 2026",
        "metaDescriptionMs": "Panduan tuntutan insurans pembaikan BC 2026. Prosedur, liputan, hak.",
        "titleZhHant": "BC省裝修保險理賠指南（2026）：流程與權利",
        "metaDescriptionZhHant": "BC省裝修保險理賠2026完整指南。流程、承保範圍及權利。",
    },
    # Whole house renovation
    "whole-house-renovation-vancouver-bc-2026": {
        "titleKo": "밴쿠버 Whole House 리노베이션 2026: 비용, 허가 및 실제 사례",
        "metaDescriptionKo": "밴쿠버 2026 Whole House 리노베이션 비용 가이드. 실제 프로젝트 데이터.",
        "titleJa": "バンクーバー住宅全体リノベーション 2026: 費用、許可および実例",
        "metaDescriptionJa": "バンクーバー2026年住宅全体リノベーション費用ガイド。実際のプロジェクトデータ。",
        "titleHi": "वैंकूवर पूरा घर रेनोवेशन 2026: लागत, अनुमति और वास्तविक उदाहरण",
        "metaDescriptionHi": "वैंकूवर 2026 पूरा घर रेनोवेशन लागत गाइड। वास्तविक डेटा।",
        "titleAr": "تجديد المنزل بالكامل في فانكوفر 2026: التكاليف والتصاريح",
        "metaDescriptionAr": "دليل تجديد المنزل بالكامل في فانكوفر 2026: التكاليف والتصاريح والبيانات الحقيقية.",
        "titleFr": "Rénovation complète Vancouver BC 2026: Coûts, permis et exemples réels",
        "metaDescriptionFr": "Guide rénovation complète Vancouver BC 2026. Coûts, permis, données réelles.",
        "titleEs": "Renovación de casa completa Vancouver BC 2026: Costos y permisos",
        "metaDescriptionEs": "Guía renovación casa completa Vancouver BC 2026. Costos, permisos, datos reales.",
        "titleTh": "การตกแต่งบ้านทั้งหลังแวนคูเวอร์ 2026",
        "metaDescriptionTh": "คู่มือการตกแต่งบ้านทั้งหลังแวนคูเวอร์ 2026 ค่าใช้จ่าย ใบอนุญาต ข้อมูลจริง",
        "titleVi": "Cải tạo toàn bộ nhà Vancouver BC 2026: Chi phí và giấy phép",
        "metaDescriptionVi": "Hướng dẫn cải tạo toàn bộ nhà Vancouver BC 2026. Chi phí, giấy phép, dữ liệu thực tế.",
        "titleTl": "Buong House Renovation Vancouver BC 2026: Gastos at Permiso",
        "metaDescriptionTl": "Gabay sa buong house renovation Vancouver BC 2026. Gastos, permiso, real na datos.",
        "titleId": "Renovasi Rumah Penuh Vancouver BC 2026: Biaya dan Izin",
        "metaDescriptionId": "Panduan renovasi rumah penuh Vancouver BC 2026. Biaya, izin, data nyata.",
        "titleMs": "Pembaikan Rumah Penuh Vancouver BC 2026: Kos dan Permit",
        "metaDescriptionMs": "Panduan pembaikan rumah penuh Vancouver BC 2026. Kos, permit, data sebenar.",
        "titleZhHant": "溫哥華整體裝修卑詩省（2026）：費用、許可證與真實案例",
        "metaDescriptionZhHant": "溫哥華2026年整屋裝修費用指南。來自Reno Stars真實項目數據。",
    },
}

FILES = [
    'blog-drafts/bathroom-renovation-delta-bc-2026.json',
    'blog-drafts/commercial-renovation-cost-vancouver-2026.json',
    'blog-drafts/heat-pump-installation-bc-hydro-rebates-2026.json',
    'blog-drafts/poly-b-pipe-replacement-vancouver-2026.json',
    'blog-drafts/renovation-deposit-bc-guide.json',
    'blog-drafts/renovation-insurance-claims-bc-2026.json',
    'blog-drafts/whole-house-renovation-vancouver-bc-2026.json',
]

for filepath in FILES:
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    try:
        d = json.loads(raw.decode('utf-8'))
    except json.JSONDecodeError as e:
        print(f"PARSE ERROR {filepath}: {e}")
        continue
    
    slug = d.get('slug', '')
    
    if d.get('localizations') is not None and d.get('localizations') != {}:
        print(f"OK (has localizations): {filepath} ({slug})")
        continue
    
    if slug not in LOCALIZATIONS:
        print(f"NO LOC TEMPLATE for slug={slug} in {filepath}")
        continue
    
    d['localizations'] = LOCALIZATIONS[slug]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    
    print(f"FIXED: {filepath} ({slug}) — added 14-locale localizations")

print("\nDone.")
