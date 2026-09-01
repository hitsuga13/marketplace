const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const outDir = path.join(process.cwd(), 'output', 'documents')
const workDir = path.join(process.cwd(), 'tmp', 'ucmp-final-assignment-docx')
const docxPath = path.join(outDir, 'UCMP_Project_Proposal_Report_5_EDITED.docx')

fs.rmSync(workDir, { recursive: true, force: true })
fs.mkdirSync(path.join(workDir, '_rels'), { recursive: true })
fs.mkdirSync(path.join(workDir, 'word', '_rels'), { recursive: true })
fs.mkdirSync(path.join(workDir, 'docProps'), { recursive: true })
fs.mkdirSync(outDir, { recursive: true })

const x = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const p = (text = '', style = 'Normal') => {
  const styleXml = style === 'Normal' ? '' : `<w:pStyle w:val="${style}"/>`
  return `<w:p><w:pPr>${styleXml}</w:pPr><w:r><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p>`
}

const bullet = (text) =>
  `<w:p><w:pPr><w:pStyle w:val="Bullet"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p>`

const numbered = (text) =>
  `<w:p><w:pPr><w:pStyle w:val="Numbered"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p>`

const table = (headers, rows, widths = []) => {
  const isEnhancedRow = (items) =>
    items.some((item) => String(item).includes('HCI Enhancement') || String(item).includes('Refined'))
  const cell = (text, header = false, i = 0, enhanced = false) => {
    const fill = header ? 'EAF2F8' : enhanced ? 'EAF7EF' : ''
    return `<w:tc><w:tcPr><w:tcW w:w="${widths[i] || 2400}" w:type="dxa"/>${fill ? `<w:shd w:fill="${fill}"/>` : ''}</w:tcPr><w:p><w:r><w:rPr>${header || enhanced ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p></w:tc>`
  }
  const rowXml = (items, header = false) => {
    const enhanced = !header && isEnhancedRow(items)
    return `<w:tr>${items.map((item, i) => cell(item, header, i, enhanced)).join('')}</w:tr>`
  }
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblLook w:val="04A0"/></w:tblPr>${rowXml(headers, true)}${rows.map((row) => rowXml(row)).join('')}</w:tbl>`
}

const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
const content = []

content.push(p('FACULTY OF DEFENCE SCIENCE TECHNOLOGY', 'CoverSmall'))
content.push(p('NATIONAL DEFENCE UNIVERSITY OF MALAYSIA', 'CoverSmall'))
content.push(p('SUNGAI BESI, KUALA LUMPUR', 'CoverSmall'))
content.push(p('TSI 3723 HUMAN COMPUTER INTERACTION', 'CoverSmall'))
content.push(p('PROJECT: UPNM CAMPUS MARKETPLACE (UCMP)', 'Title'))
content.push(p('FINAL PROJECT REPORT', 'Subtitle'))
content.push(p('DATE: 31 AUGUST 2026'))
content.push(p('LECTURER: PROF. MADYA TS. DR. NORSHAHRIAH BINTI WAHAB'))
content.push(p('GROUP: UPNM MARKET PLACE (UCMP) (1TSC)'))
content.push(p('Based on the refined SED project and Tutorial 2 HCI proposal.'))
content.push(pageBreak)

content.push(p('TABLE OF CONTENT', 'Heading1'))
content.push(p('1.0 Introduction'))
content.push(p('1.1 Purpose'))
content.push(p('1.2 Scope'))
content.push(p('1.3 Objectives'))
content.push(p('1.4 User Characteristics'))
content.push(p('2.0 Specific Requirements'))
content.push(p('2.1 Functional Requirements'))
content.push(p('2.2 Non-Functional Requirements'))
content.push(p('2.3 Actors Requirement'))
content.push(p('3.0 User Effectiveness'))
content.push(p('4.0 User Satisfaction'))
content.push(p('5.0 Conclusion'))
content.push(pageBreak)

content.push(p('1.0 Introduction', 'Heading1'))
content.push(p('1.1 Purpose', 'Heading2'))
content.push(p('The purpose of the UPNM Campus Marketplace (UCMP) system is to provide a centralized web-based platform for buying and selling activities within the UPNM community. Currently, campus buying and selling activities are mostly done through scattered platforms such as WhatsApp groups, Telegram, and face-to-face arrangements. This makes it difficult for users to find products, contact sellers, manage orders, arrange meetups, and keep payment proof properly.'))
content.push(p('In the earlier Software Engineering and Design (SED) version, the system focused mainly on core marketplace functions such as product browsing, product searching, buyer-seller chat, cart management, checkout, manual QR payment arrangement, receipt upload, order management, seller product listing, admin monitoring, and report generation.'))
content.push(p('For the HCI final project, UCMP is refined beyond the old SED version by improving safety, feedback, trust, and user satisfaction. The improved version introduces clearer real-time chat feedback, stronger seller trust indicators, better manual payment guidance, receipt preview, AI-powered product moderation, seller warning enforcement, locked rejected-product audit records, and admin review of AI decisions.'))
content.push(p('The system helps buyers to search products, view product details, chat with sellers, add items to cart, upload payment receipts, and track orders. It helps sellers to manage products, upload product images, manage orders, confirm receipts, update order status, and understand moderation warnings. It also helps admins to manage users, products, orders, receipts, reports, and AI moderation records.'))
content.push(p('The system does not include UPNM identity verification, FPX payment gateway, or direct in-app payment processing. Payment is handled manually, where the seller provides a QR code and the buyer pays outside the system using a banking or e-wallet application. The HCI improvement is that this manual flow is made clearer through step-by-step guidance, visible status feedback, and receipt upload confirmation.'))

content.push(p('1.2 Scope', 'Heading2'))
content.push(p('System Users', 'Heading3'))
content.push(table(['User Group', 'Description'], [
  ['Guest', 'A user who has not logged in. Guest can browse products, search products, view product details, sign up, log in, and recover account.'],
  ['Buyer', 'A registered user who buys products or services. Buyer can browse, chat, add to cart, checkout, upload receipt, track orders, and view purchase history.'],
  ['Seller', 'A registered user who sells products or services. Seller can manage listings, upload images, manage orders, view receipts, update order status, and manage promotions.'],
  ['Admin', 'A user who manages the system. Admin can manage users, products, orders, receipts, reports, AI moderation results, and marketplace activity.'],
], [1800, 6800]))
content.push(p('Core Functions', 'Heading3'))
content.push(table(['Core Function', 'Description'], [
  ['User Management', 'Handles user registration, sign in, logout, profile updates, password recovery, and account status.'],
  ['Product Management', 'Handles product browsing, searching, product details, seller product listings, stock, categories, variations, add-ons, and visibility.'],
  ['Cart Management', 'Handles adding products to cart, selecting items, updating quantity, removing items, and calculating subtotal.'],
  ['Order Management', 'Handles checkout, receipt upload, order creation, tracking, cancellation, seller confirmation, sent status, completion, rejection, and refund status. HCI Enhancement: clearer payment steps and receipt preview improve confidence during manual QR payment.'],
  ['Chat Management', 'Handles buyer-seller conversations, message sending, chat inbox, search, unread counts, and online/offline status. HCI Enhancement: sent, delivered, and read indicators reduce communication uncertainty.'],
  ['Admin Management', 'Handles admin control over users, products, orders, receipts, reports, and AI moderation review. HCI Enhancement: admin can confirm or override AI decisions using clearer review actions.'],
  ['Data Synchronization', 'Handles local data storage and synchronization of users, products, orders, and chat messages with Supabase.'],
  ['AI Moderation and Safety', 'HCI Enhancement: AI checks product images, names, and descriptions before publication, rejects prohibited products, warns sellers, and keeps rejected listings as audit records.'],
], [2200, 6400]))
content.push(p('Limitations', 'Heading3'))
content.push(bullet('The system does not verify users through official UPNM records.'))
content.push(bullet('The system does not include FPX, payment gateway, or direct payment processing.'))
content.push(bullet('Payment is completed outside the system using the seller QR code.'))
content.push(bullet('Sellers or admins need to check uploaded receipts manually.'))
content.push(bullet('The system depends on Supabase free-tier database, storage, and egress limits.'))
content.push(bullet('The system is web-based and does not include a separate native mobile application.'))

content.push(p('1.3 Objectives', 'Heading2'))
content.push(bullet('To provide a centralized marketplace for UPNM students, staff, and small campus sellers.'))
content.push(bullet('To support product browsing, product searching, buyer-seller communication, checkout, and order tracking in one system.'))
content.push(bullet('To provide a clear manual QR payment workflow with receipt upload and seller payment verification.'))
content.push(bullet('Refined HCI objective: To improve marketplace trust using seller profiles, ratings, reviews, and completed order indicators instead of formal verified badges.'))
content.push(bullet('Refined HCI objective: To improve campus marketplace safety through AI-powered product moderation, seller warning enforcement, and admin review.'))
content.push(bullet('Refined HCI objective: To apply HCI principles such as visibility of system status, error prevention, feedback, consistency, and user-centred design.'))

content.push(p('1.4 User Characteristics', 'Heading2'))
content.push(table(['User Role', 'Description', 'Technical Skill Level', 'Frequency of Use'], [
  ['Guest', 'Non-logged-in user who browses and searches products before deciding to register.', 'Basic digital literacy', 'Occasional'],
  ['Buyer', 'Registered user who buys products, chats with sellers, uses cart, pays manually, uploads receipts, and tracks orders. Refined HCI focus: needs trust indicators, clear payment guidance, and real-time feedback.', 'Basic digital literacy and smartphone use', 'Frequent when purchasing'],
  ['Seller', 'Registered vendor who uploads products, manages stock, handles buyer chats, checks receipts, and updates order status. Refined HCI focus: needs immediate AI feedback and clear regulation warnings.', 'Basic to moderate digital literacy', 'Daily or selected business hours'],
  ['Admin', 'System manager who monitors users, products, orders, reports, and AI moderation decisions. Refined HCI focus: needs clear review labels to confirm or override AI decisions.', 'Moderate digital literacy and system management skills', 'Regular monitoring'],
], [1500, 4300, 2200, 1800]))

content.push(p('2.0 Specific Requirements', 'Heading1'))
content.push(p('This section describes the functional and non-functional requirements of the UCMP system. The old SED requirements are retained as the foundation, while the HCI final project adds improvements that make the system safer, easier to understand, and more satisfying to use. Rows marked as HCI Enhancement show the new or refined functions added for the HCI version.'))
content.push(p('2.1 Functional Requirements', 'Heading2'))
content.push(table(['ID', 'Requirement Description', 'User'], [
  ['FR1', 'The system shall allow users to sign up, sign in, log out, recover account, and update profile information.', 'Guest, Buyer, Seller, Admin'],
  ['FR2', 'The system shall allow guests and buyers to browse, search, and view product details including image, price, stock, description, variation, add-ons, and seller information.', 'Guest, Buyer'],
  ['FR3', 'The system shall allow buyers to add products to cart, update quantity, remove items, select items, and calculate subtotal before checkout.', 'Buyer'],
  ['FR4', 'HCI Enhancement: The system shall allow buyers to complete checkout using a clearer manual QR payment flow, step-by-step payment guidance, receipt upload, and receipt preview as proof of payment.', 'Buyer'],
  ['FR5', 'The system shall allow sellers to upload and manage product listings under their own seller account, including name, category, image, price, stock, description, variations, and add-ons.', 'Seller'],
  ['FR6', 'HCI Enhancement: The system shall use AI moderation to check uploaded product images, titles, and descriptions before publication.', 'Seller, Admin'],
  ['FR7', 'HCI Enhancement: The system shall publish AI-approved products and hide AI-rejected products from buyers.', 'Buyer, Seller'],
  ['FR8', 'HCI Enhancement: The system shall notify sellers through a pop-up warning when a product is rejected for violating UPNM marketplace regulations.', 'Seller'],
  ['FR9', 'HCI Enhancement: The system shall prevent sellers from editing or deleting rejected products so that moderation evidence remains in the database.', 'Seller, Admin'],
  ['FR10', 'HCI Enhancement: The system shall allow admins to confirm or override AI moderation decisions using clear review actions.', 'Admin'],
  ['FR11', 'HCI Enhancement: The system shall provide buyer-seller chat with online/offline indicators and message sent, delivered, and read status.', 'Buyer, Seller'],
  ['FR12', 'The system shall allow sellers to view uploaded receipts and approve or reject payment manually after checking their bank or e-wallet application.', 'Seller'],
  ['FR13', 'The system shall allow admins to manage users, products, orders, receipts, reports, and marketplace activity.', 'Admin'],
], [900, 5800, 1900]))

content.push(p('2.2 Non-Functional Requirements', 'Heading2'))
content.push(table(['ID', 'Requirement Description', 'Constraint Source'], [
  ['NFR1', 'Usability: The interface shall be simple, responsive, and understandable for first-time users on desktop and mobile browsers.', 'User expectation'],
  ['NFR2', 'Performance: Product browsing, chat, order status, and receipt updates should respond within a reasonable time depending on internet and Supabase availability.', 'System performance'],
  ['NFR3', 'Security: The system shall protect user data, product data, chat data, uploaded images, and payment receipts through secure access control.', 'Data protection'],
  ['NFR4', 'Role-Based Access: Buyers, sellers, and admins shall only access functions related to their role.', 'System requirement'],
  ['NFR5', 'Reliability: Product, order, chat, and receipt data should remain available and synchronized with Supabase whenever the internet connection is active.', 'Operational need'],
  ['NFR6', 'HCI Enhancement - Transparency: The system shall provide clear feedback for payment status, network status, product moderation status, seller warnings, and admin review outcomes.', 'HCI requirement'],
  ['NFR7', 'HCI Enhancement - Auditability: Rejected products and repeated prohibited listing attempts shall remain recorded for admin review and seller accountability.', 'Marketplace safety'],
], [900, 5800, 1900]))

content.push(p('2.3 Actors Requirement', 'Heading2'))
content.push(p('2.3.1 Authentication (All Actors)', 'Heading3'))
content.push(bullet('The system shall allow users to create an account by entering required credentials and selecting the correct role.'))
content.push(bullet('The system shall validate sign-in credentials and redirect users to the correct dashboard based on role.'))
content.push(bullet('The system shall provide account recovery and profile update functions.'))
content.push(p('2.3.2 Buyer Functions', 'Heading3'))
content.push(bullet('The buyer shall be able to browse products, search listings, view product details, add products to cart, and proceed to checkout.'))
content.push(bullet('The buyer shall be able to view seller information, rating, completed orders, and product availability before purchasing.'))
content.push(bullet('The buyer shall be able to scan the seller QR code, upload receipt proof, chat with seller, and track order status.'))
content.push(p('2.3.3 Seller Functions', 'Heading3'))
content.push(bullet('The seller shall be able to create a seller account and post products only under that seller account.'))
content.push(bullet('The seller shall be able to manage approved product listings, stock, order status, payment receipts, and buyer conversations.'))
content.push(bullet('The seller shall receive instant AI moderation feedback when a prohibited item is detected.'))
content.push(bullet('The seller shall not be allowed to delete or edit rejected products because they act as audit evidence.'))
content.push(p('2.3.4 Administrator Functions', 'Heading3'))
content.push(bullet('The administrator shall be able to monitor all users, products, orders, receipts, reports, and chat-related marketplace activity.'))
content.push(bullet('The administrator shall be able to review AI moderation results and confirm or override AI decisions.'))
content.push(bullet('The administrator shall be able to manage prohibited product categories and seller account status when repeated violations occur.'))

content.push(p('3.0 User Effectiveness', 'Heading1'))
content.push(p('User effectiveness refers to how successfully each user group can complete its intended tasks using the UCMP system. In the HCI context, the system is effective when users can complete their goals with minimal confusion, fewer errors, and clear feedback at every important step.'))
content.push(p('3.1 Specific Task Effectiveness', 'Heading2'))
content.push(p('3.1.1 Buyer', 'Heading3'))
content.push(bullet('Buyers can browse and search products from one centralized marketplace instead of checking multiple chat groups.'))
content.push(bullet('Buyers can complete the manual payment process more effectively because the checkout flow shows the seller QR code, gives clear instructions, and provides receipt upload with preview.'))
content.push(bullet('Buyers can judge seller reliability through ratings, written reviews, completed order count, and seller profile details.'))
content.push(bullet('Buyers receive clearer communication through chat status, sent/delivered/read ticks, and order status notifications.'))
content.push(p('3.1.2 Seller', 'Heading3'))
content.push(bullet('Sellers can upload products under their own seller account, manage stock and product details, and handle orders from one dashboard.'))
content.push(bullet('Sellers receive instant AI feedback after product submission, reducing waiting time and uncertainty.'))
content.push(bullet('Sellers are warned immediately when they attempt to post prohibited products, helping them understand UCMP and UPNM marketplace regulations.'))
content.push(bullet('Sellers can verify uploaded receipts manually before approving payment, which reduces payment disputes.'))
content.push(p('3.1.3 Administrator', 'Heading3'))
content.push(bullet('Admins can monitor AI decisions, product status, seller offences, and audit trails from the admin page.'))
content.push(bullet('Admins can confirm AI decisions when they are correct or override decisions when the AI makes a mistake.'))
content.push(bullet('Admins can maintain marketplace safety by keeping rejected product evidence and suspending sellers after repeated prohibited listing attempts.'))

content.push(p('3.2 AI Features', 'Heading2'))
content.push(p('3.2.1 AI Product Moderation', 'Heading3'))
content.push(p('The main AI feature in UCMP is product moderation. When a seller uploads a product, the AI checks the product image, title, category, and description. It determines whether the product is approved or rejected based on campus marketplace safety rules. Prohibited items include vape, cigarettes, alcohol, drugs, weapons, offensive content, and any unsafe product that violates UCMP or UPNM regulations.'))
content.push(p('If the product is approved, it is published immediately and buyers can view it. If the product is rejected, it is hidden from buyers, locked as database evidence, and the seller receives a warning notification. Admins still perform a final review, but the AI is responsible for the first decision.'))
content.push(p('3.2.2 Warning and Enforcement Flow', 'Heading3'))
content.push(numbered('Seller uploads product with image, title, category, and description.'))
content.push(numbered('AI checks whether the product is legal and suitable for the UPNM campus marketplace.'))
content.push(numbered('AI returns an approved or rejected decision with an explanation.'))
content.push(numbered('Rejected products are locked and cannot be deleted or edited by the seller.'))
content.push(numbered('The seller receives a pop-up warning explaining that selling prohibited products violates UCMP regulations.'))
content.push(numbered('After three rejected prohibited-product attempts, the seller account may be suspended.'))
content.push(numbered('Admin reviews the AI decision and can confirm it or override it.'))
content.push(p('3.3 Interface Theme and HCI Principles', 'Heading2'))
content.push(table(['HCI Principle', 'Application in UCMP'], [
  ['Visibility of system status', 'Online/offline indicators, chat ticks, moderation labels, payment status, and order updates tell users what is happening.'],
  ['Error prevention', 'AI moderation prevents prohibited products from being published and receipt preview reduces wrong-file uploads.'],
  ['Feedback', 'The system uses notifications, pop-up dialogs, and status chips to show successful actions, warnings, and rejected products.'],
  ['Consistency', 'Buyer, seller, and admin dashboards use consistent buttons, icons, colour labels, and status wording.'],
  ['User control', 'Admins can override AI decisions, while sellers can manage approved products and orders.'],
], [2600, 6000]))

content.push(p('4.0 User Satisfaction', 'Heading1'))
content.push(p('User satisfaction focuses on whether users feel confident, safe, and comfortable while using UCMP. Since the project does not use official UPNM identity verification or an integrated payment gateway, the interface must create trust through clear design, reliable feedback, and transparent system behaviour.'))
content.push(p('4.1 Evaluation Criteria and Performance Metrics', 'Heading2'))
content.push(table(['Metric', 'Purpose', 'Expected Measurement'], [
  ['Task Success Rate', 'Measures whether users can complete registration, product browsing, checkout, receipt upload, product upload, and admin review.', 'Percentage of successful task completion.'],
  ['Time on Task', 'Measures how long users take to complete checkout, receipt upload, product posting, and payment verification.', 'Average completion time per task.'],
  ['Error Rate', 'Measures mistakes such as wrong receipt upload, failed product submission, misunderstood moderation decision, or wrong admin action.', 'Number of errors per test session.'],
  ['Satisfaction Score', 'Measures user comfort and confidence after completing tasks.', 'Likert scale or SUS questionnaire score.'],
  ['Trust Perception', 'Measures whether buyers feel safe using seller ratings, reviews, completed orders, and AI moderation.', 'Survey feedback after product browsing and checkout.'],
], [1800, 4300, 2600]))
content.push(p('4.2 Impact of Integrated AI Tools', 'Heading2'))
content.push(p('AI moderation improves satisfaction by reducing the chance that buyers encounter unsafe or prohibited products. It also helps sellers understand marketplace rules immediately because rejected products trigger a clear warning message. The admin review function increases trust because users know that AI decisions are not left unchecked.'))
content.push(p('4.2.1 AI Image and Text Scanning', 'Heading3'))
content.push(bullet('The AI checks both product image and text, so sellers cannot easily hide prohibited products using fake names or descriptions.'))
content.push(bullet('The decision is immediate, which reduces waiting time and supports a smoother seller experience.'))
content.push(bullet('Rejected products remain available to admins as audit records, which improves accountability.'))
content.push(p('4.2.2 Real-Time Feedback and Chat Indicators', 'Heading3'))
content.push(bullet('Online/offline status helps users know whether the other party is available.'))
content.push(bullet('Sent, delivered, and read indicators reduce uncertainty in buyer-seller communication.'))
content.push(bullet('Order and payment notifications reduce the need for users to refresh the page repeatedly.'))
content.push(p('4.2.3 Manual QR Payment Satisfaction', 'Heading3'))
content.push(bullet('Step-by-step QR payment instructions reduce confusion caused by manual payment.'))
content.push(bullet('Receipt preview helps buyers confirm that the correct payment proof has been uploaded.'))
content.push(bullet('Seller payment verification supports trust because payment approval is based on the seller checking the actual bank or e-wallet transaction.'))
content.push(p('4.3 User Satisfaction Breakdown by Role', 'Heading2'))
content.push(table(['User Role', 'Satisfaction Factor'], [
  ['Buyer', 'Feels safer because products are moderated, sellers have visible trust indicators, and payment instructions are clear.'],
  ['Seller', 'Feels guided because the system gives immediate feedback, warning messages, and simple product/order controls.'],
  ['Admin', 'Feels in control because AI decisions are visible, review actions are clear, and rejected products remain as audit evidence.'],
], [1800, 6800]))

content.push(p('5.0 Conclusion', 'Heading1'))
content.push(p('The UPNM Campus Marketplace (UCMP) final project refines the previous Software Engineering and Design project into a stronger Human-Computer Interaction solution. The system is not only focused on features, but also on how buyers, sellers, and admins experience the platform. The project addresses campus marketplace problems by centralizing buying and selling activities, improving manual payment clarity, supporting real-time communication, and strengthening marketplace trust.'))
content.push(p('The most important enhancement is the AI-powered product moderation feature. By checking product images, titles, and descriptions before publication, UCMP can reduce prohibited product listings such as vape, cigarettes, alcohol, drugs, weapons, and offensive content. The system also provides seller warnings, preserves rejected products as audit records, and allows admins to confirm or override AI decisions.'))
content.push(p('Overall, UCMP applies HCI principles such as visibility of system status, feedback, error prevention, consistency, and user-centred design. These improvements are expected to increase task effectiveness, reduce user confusion, and improve user satisfaction among buyers, sellers, and administrators in the UPNM community.'))

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${content.join('\n')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1080" w:bottom="1440" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="150" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="CoverSmall"><w:name w:val="Cover Small"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:before="360" w:after="180"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F4E79"/><w:sz w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:spacing w:after="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="5B6770"/><w:sz w:val="28"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="160"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="1F4E79"/><w:sz w:val="30"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="2F75B5"/><w:sz w:val="25"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="80"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="404040"/><w:sz w:val="23"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Numbered"><w:name w:val="Numbered"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/><w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideV w:val="single" w:sz="4" w:color="D9D9D9"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`

const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num><w:abstractNum w:abstractNumId="2"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num></w:numbering>`

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`
const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>UCMP Final Project Report</dc:title><dc:creator>UCMP Group</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-08-31T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-31T00:00:00Z</dcterms:modified></cp:coreProperties>`
const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>`

const write = (rel, data) => fs.writeFileSync(path.join(workDir, rel), data)
write('[Content_Types].xml', contentTypes)
write('_rels/.rels', rootRels)
write('word/document.xml', documentXml)
write('word/styles.xml', stylesXml)
write('word/numbering.xml', numberingXml)
write('word/_rels/document.xml.rels', docRels)
write('docProps/core.xml', core)
write('docProps/app.xml', app)

const zipPath = path.join(outDir, 'UCMP_Project_Proposal_Report_5_EDITED.zip')
fs.rmSync(zipPath, { force: true })
fs.rmSync(docxPath, { force: true })
const zipCommand = `
Add-Type -AssemblyName System.IO.Compression;
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$source = '${workDir}';
$destination = '${zipPath}';
if (Test-Path $destination) { Remove-Item -LiteralPath $destination -Force }
$zip = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create);
Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($source.Length + 1).Replace([char]92, [char]47);
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relative) | Out-Null;
};
$zip.Dispose();
`
execFileSync('powershell.exe', ['-NoProfile', '-Command', zipCommand], { stdio: 'inherit' })
fs.renameSync(zipPath, docxPath)
console.log(docxPath)
