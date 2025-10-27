# 🎧 PRD: AI Podcast Generator SaaS (BYOK Model)

## 1. Product Overview

**ชื่อโปรเจ็กต์:** AI Podcast Generator
**ประเภท:** SaaS (Web Application)
**เป้าหมายหลัก:**
ช่วยให้ผู้ใช้สร้างพอดแคสต์แบบครบวงจรตั้งแต่ “ไอเดีย → สคริปต์ → เสียง → ภาพ → วิดีโอ → ดาวน์โหลด”
โดยระบบคิดเครดิตเฉพาะขั้นตอนที่สำเร็จ และให้ผู้ใช้กรอก API key ของตนเอง (BYOK)

---

## 2. Key Objectives

1. ให้ผู้ใช้ทั่วไปและนักสร้างคอนเทนต์สร้างพอดแคสต์ได้รวดเร็วภายในไม่กี่นาที
2. ลดต้นทุนด้วยโมเดล **BYOK (Bring Your Own Key)**
3. สร้างรายได้จาก **Platform Credit Fee** (คิดเครดิตต่อการ Generate สำเร็จ)
4. รองรับหลายภาษา โดยเฉพาะภาษาไทยและอังกฤษ
5. สามารถดาวน์โหลด resource ทั้งหมดเพื่อไปตัดต่อเพิ่มเติมได้

---

## 3. Core Features

| ฟีเจอร์                                        | รายละเอียด                                                                                                                                                                                 | เครดิตที่หัก |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| **1️⃣ กรอกรายละเอียด Podcast**                 | ผู้ใช้ระบุหัวข้อ แนวทางการเล่า เพศเสียง โทน อารมณ์ ความยาว (5/10/30/60 นาที) <br> ระบบตั้งชื่อหัวข้อให้อัตโนมัติถ้าไม่ระบุ                                                                 | 3            |
| **2️⃣ สร้างสคริปต์ (Script Generation)**       | ใช้ **OpenAI API (BYOK)** เพื่อสร้างสคริปต์ตาม template ที่เลือก เช่น Storytelling / Educational / Interview / Marketing / News                                                            | 3            |
| **3️⃣ ตรวจสอบ / แก้สคริปต์**                   | ผู้ใช้แก้ไขข้อความก่อนสังเคราะห์เสียง ไม่มีค่าเครดิต                                                                                                                                       | 0            |
| **4️⃣ สร้างเสียงพูด (TTS)**                    | รองรับ 2 ระบบ<br>• **KIE API → ElevenLabs Multilingual V2** (12 credits / 1k chars ≈ $0.06)<br>• **Google AI Studio → Gemini TTS** (ทางเลือกในอนาคต)<br> ระบบหักเครดิตหลัง Generate สำเร็จ | 3            |
| **5️⃣ สร้างภาพ Podcast Cover**                 | ใช้ **KIE API (Flux)** <br>เลือกระหว่างแนวตั้ง / แนวนอน / สี่เหลี่ยม <br>มี preset เช่น “Studio mic”, “Host portrait”, “Minimal gradient”                                                  | 3            |
| **6️⃣ สร้างวิดีโอเคลื่อนไหว (Animated Video)** | ใช้ **KIE API (hailao / runway module)** <br>สร้างคลิปจากภาพที่เลือก                                                                                                                       | 3            |
| **7️⃣ ดาวน์โหลด Resources**                    | ดาวน์โหลดเป็น ZIP รวมไฟล์ทั้งหมด: audio, image, video, transcript, metadata.json                                                                                                           | 0            |
| **8️⃣ SEO Suggestion (ฟรี)**                   | ระบบแนะนำ Title, Description, Tags, Keywords <br>ใช้ OpenAI API ของผู้ใช้                                                                                                                  | 0            |
| **9️⃣ Platform Service Fee**                   | คิดค่าธรรมเนียม 3 เครดิต ต่อการ Generate สำเร็จแต่ละครั้ง (คืนเครดิตหากไม่สำเร็จ)                                                                                                          | 3            |

---

## 4. BYOK (Bring Your Own Key)

ผู้ใช้ต้องเตรียม API Key ด้วยตนเอง:

* **OpenAI API Key** → สำหรับ Script & SEO
* **KIE API Key** → สำหรับ ElevenLabs (TTS) + Flux (Image) + hailao (Video)
* **(Optional)** Google AI Studio Key → สำหรับ TTS ภาษาไทย

ระบบของแพลตฟอร์มจะไม่รับภาระต้นทุนเครดิตของผู้ใช้

---

## 5. Flow Overview

### Step-by-Step (MVP)

1. **User Registration / Login**

   * สมัครสมาชิก → ยืนยันอีเมล
   * เข้าสู่ระบบเพื่อกรอก API Keys

2. **Input Stage**

   * กรอกหัวข้อ / แนวทางการเล่า / เพศเสียง / ความยาว
   * ระบบประเมินจำนวนเครดิตที่จะใช้
   * หัก 3 เครดิตทันทีเมื่อยืนยัน “สร้างตอนใหม่”

3. **Script Generation**

   * เรียก OpenAI API ตาม template ที่เลือก
   * ตั้งชื่อหัวข้ออัตโนมัติ (หากเว้นว่าง)
   * หักเพิ่ม 3 เครดิต

4. **User Review Script**

   * ตรวจสอบ / แก้ไข / ยืนยันสคริปต์ก่อนสร้างเสียง

5. **TTS Generation**

   * เรียก ElevenLabs ผ่าน KIE API
   * รองรับเสียงชาย/หญิง / ภาษาไทย / อังกฤษ
   * แสดงเครดิตคาดการณ์ตามจำนวนอักษร
   * หักเพิ่ม 3 เครดิต (เฉพาะเมื่อสำเร็จ)

6. **Image Generation**

   * เรียก KIE Flux
   * ผู้ใช้เลือกขนาดและแนวภาพ
   * หัก 3 เครดิต

7. **Animated Video**

   * สร้างวิดีโอจากภาพ (hailao)
   * หัก 3 เครดิต

8. **SEO Suggestion**

   * ใช้ OpenAI API → แนะนำ title / description / tags ฟรี
   * ไม่หักเครดิตแพลตฟอร์ม

9. **Download Resources**

   * ระบบรวมทั้งหมดเป็น ZIP
   * Metadata (JSON) เก็บข้อมูล script / voice / credit log

10. **Credit Refund / Error Handling**

* หากขั้นตอนใดล้มเหลว → คืนเครดิต
* บันทึก transaction ลงใน credit ledger

---

## 6. Credit System

| รายการ            | เครดิตที่ใช้ | เงื่อนไขคืนเครดิต                |
| ----------------- | ------------ | -------------------------------- |
| Brief Input       | 3            | ถ้าไม่สร้างตอนต่อ → คืน          |
| Script Generation | 3            | ถ้า error / fail → คืน           |
| TTS Audio         | 3            | เฉพาะเมื่อ success               |
| Image             | 3            | ถ้า fail → คืน                   |
| Video             | 3            | ถ้า fail → คืน                   |
| Platform Fee      | 3            | หักเมื่อ generate สำเร็จเท่านั้น |
| SEO Suggestion    | 0            | ฟรี                              |

> รวมเฉลี่ย **18 เครดิต / ตอน** (ไม่รวมเครดิตของ KIE / OpenAI)
> ผู้ใช้เห็น “เครดิตที่ใช้จริง / เครดิตคาดการณ์” ทุกครั้งก่อนสั่งงาน

---

## 7. Credit Pricing (ภายในระบบ)

| แพ็กเกจ    | เครดิตรวม | ราคา (USD) | ราคา/เครดิต |
| ---------- | --------: | ---------: | ----------: |
| Starter    |       100 |         $2 |       $0.02 |
| Pro        |       300 |         $5 |      $0.016 |
| Studio     |     1 000 |        $15 |      $0.015 |
| Enterprise |     5 000 |        $60 |      $0.012 |

> ผู้ใช้สามารถซื้อเครดิตในระบบเพื่อใช้เป็น “Platform Fee” ได้
> ส่วนเครดิตของ API (KIE, OpenAI) จ่ายตรงให้ผู้ให้บริการ

---

## 8. Architecture (MVP)

| ส่วน           | เทคโนโลยี                                                         |
| -------------- | ----------------------------------------------------------------- |
| **Frontend**   | React + Tailwind (หรือ Next.js)                                   |
| **Backend**    | Flask / FastAPI (Python)                                          |
| **Database**   | PostgreSQL / SQLite (dev)                                         |
| **Task Queue** | Celery / RQ                                                       |
| **Storage**    | AWS S3 / Cloudflare R2 (audio, image, video, zip)                 |
| **API**        | OpenAI, KIE (ElevenLabs/Flux/hailao), Google AI Studio (optional) |
| **Auth**       | Flask-Login / JWT                                                 |
| **Encryption** | AES สำหรับเก็บ API keys                                           |
| **Payment**    | Stripe (เครดิตในระบบ)                                             |

---

## 9. Data Model (ย่อ)

### `users`

| ฟิลด์         | รายละเอียด      |
| ------------- | --------------- |
| id            | user id         |
| email         | อีเมล           |
| password_hash | เข้ารหัส        |
| api_keys      | json (เข้ารหัส) |
| credits       | int             |
| created_at    | datetime        |

### `episodes`

| ฟิลด์        | รายละเอียด     |
| ------------ | -------------- |
| id           | episode id     |
| user_id      | เจ้าของ        |
| title        | ชื่อพอดแคสต์   |
| language     | th / en        |
| duration     | ความยาว (นาที) |
| script       | text           |
| audio_url    | path           |
| image_url    | path           |
| video_url    | path           |
| cost_credits | int            |
| created_at   | datetime       |

### `credit_logs`

| ฟิลด์        | รายละเอียด                        |
| ------------ | --------------------------------- |
| id           | log id                            |
| user_id      | ผู้ใช้                            |
| episode_id   | ตอน                               |
| step         | ชื่อขั้นตอน (script, tts, image…) |
| credits_used | จำนวนเครดิต                       |
| status       | success / refund                  |
| timestamp    | datetime                          |

---

## 10. Error Handling

* ตรวจสอบ API Key ก่อนทุกการเรียก
* หาก Key หมดอายุ / quota เต็ม → แจ้งผู้ใช้
* Fail ขั้นใด → rollback / คืนเครดิต
* Log ข้อผิดพลาด (error trace) ลงฐานข้อมูล

---

## 11. Security & Compliance

* เก็บ API Key ของผู้ใช้เข้ารหัสด้วย AES-256
* ใช้ HTTPS ทุก endpoint
* Voice cloning ต้องมี consent จากเจ้าของเสียง
* ฟิลเตอร์ข้อความที่ผิดนโยบาย (hate / violence / sexual)
* มีช่อง “AI-generated disclosure” ใน metadata

---

## 12. Pricing & Business Model

* SaaS มีรายได้จาก **Platform Credits** (ค่าบริการระบบ)
* ผู้ใช้เป็นผู้รับผิดชอบค่าใช้จ่าย API ภายนอก (BYOK)
* เพิ่มรายได้เสริมจาก **Subscription Plan** (เครดิตรายเดือน)
* มี Referral Bonus (ให้เครดิตฟรีเมื่อชวนเพื่อน)

---

## 13. Analytics Dashboard

* เครดิตที่ใช้ / เดือน
* ตอนที่สร้าง / เดือน
* ต้นทุนเฉลี่ย / ตอน
* การใช้งาน API key (OpenAI / KIE)
* อัตรา error / refund

---

## 14. Roadmap

| Sprint   | ระยะเวลา  | รายละเอียด                                         |
| -------- | --------- | -------------------------------------------------- |
| Sprint 1 | 2 สัปดาห์ | Core flow: Script → TTS → Image → Video → Download |
| Sprint 2 | 3 สัปดาห์ | Credit system + Refund + Dashboard                 |
| Sprint 3 | 2 สัปดาห์ | SEO Suggestion + Analytics                         |
| Sprint 4 | 3 สัปดาห์ | Pro features: Multi-speaker, Template, Branding    |

---

## 15. Success Metrics

* 🎯 80% ของผู้ใช้สร้างพอดแคสต์สำเร็จใน <10 นาที
* 🔁 อัตราการใช้ซ้ำ ≥ 50% ในเดือนแรก
* 💰 อัตรา Conversion > 20% จาก free → paid
* ⚙️ Error rate < 5% ต่อ 100 การเรียก API

---

## 16. Future Expansion

* Voice cloning (consent-based)
* Auto music bed / noise mix
* Social auto-poster (YouTube / Spotify / TikTok)
* Podcast-to-blog / transcript-to-article
* Studio branding (custom intro/outro)

---

### ✅ สรุป

Flow ที่คุณออกแบบนั้น “สมบูรณ์แบบสำหรับ MVP” แล้ว
เพียงเลือกว่าจะใช้ **ElevenLabs (ผ่าน KIE)** หรือ **Google Gemini-TTS** เป็น default voice engine
ส่วนระบบเครดิตและ BYOK พร้อมต่อยอดเป็น commercial SaaS ได้ทันที

