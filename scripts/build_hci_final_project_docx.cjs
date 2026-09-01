const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const outDir = path.join(process.cwd(), 'output', 'documents')
const workDir = path.join(process.cwd(), 'tmp', 'hci-final-docx')
const docxPath = path.join(outDir, 'UCMP_HCI_Final_Project_Report.docx')

fs.rmSync(workDir, { recursive: true, force: true })
fs.mkdirSync(path.join(workDir, '_rels'), { recursive: true })
fs.mkdirSync(path.join(workDir, 'word', '_rels'), { recursive: true })
fs.mkdirSync(path.join(workDir, 'docProps'), { recursive: true })
fs.mkdirSync(outDir, { recursive: true })

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const p = (text = '', style = 'Normal') => {
  const styleXml = style === 'Normal' ? '' : `<w:pStyle w:val="${style}"/>`
  return `<w:p><w:pPr>${styleXml}</w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

const bullet = (text) =>
  `<w:p><w:pPr><w:pStyle w:val="Bullet"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`

const numbered = (text) =>
  `<w:p><w:pPr><w:pStyle w:val="Numbered"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`

const table = (headers, rows) => {
  const cell = (text, header = false) =>
    `<w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/>${header ? '<w:shd w:fill="EAF2F8"/>' : ''}</w:tcPr><w:p><w:r><w:rPr>${header ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p></w:tc>`
  const rowXml = (items, header = false) => `<w:tr>${items.map((item) => cell(item, header)).join('')}</w:tr>`
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblLook w:val="04A0"/></w:tblPr>${rowXml(headers, true)}${rows
    .map((row) => rowXml(row))
    .join('')}</w:tbl>`
}

const sectionBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

const content = []

content.push(p('UPNM Campus Marketplace (UCMP)', 'Title'))
content.push(p('HCI Final Project Report', 'Subtitle'))
content.push(p('Course: TSI3723 Human-Computer Interaction'))
content.push(p('Semester: Short Semester 2025/2026'))
content.push(p('Project Type: Refinement and Expansion of SED Project'))
content.push(p('Prepared for: Prof. Madya Ts. Dr. Norshariah Binti Abdul Wahab'))
content.push(p('Group: UCMP (1TSC)'))
content.push(sectionBreak)

content.push(p('Executive Summary', 'Heading1'))
content.push(
  p(
    'This report presents the refined and expanded UPNM Campus Marketplace (UCMP) final project for Human-Computer Interaction. The project builds on the earlier Software Engineering and Design marketplace proposal and focuses on improving usability, trust, payment clarity, real-time feedback, and marketplace safety.',
  ),
)
content.push(
  p(
    'The final HCI refinement introduces four major improvements: internet-dependent real-time buyer-seller chat with clear status feedback, manual QR payment with receipt upload and seller verification, community trust indicators such as seller ratings and completed orders, and AI-powered product moderation that checks product images, names, and descriptions before publication.',
  ),
)
content.push(p('Project Alignment With Assignment Requirements', 'Heading1'))
content.push(table(['Assignment Requirement', 'UCMP Response'], [
  ['Project requirements', 'The system supports buyer, seller, and admin workflows including product browsing, chat, cart, checkout, payment proof upload, order tracking, seller listings, and admin monitoring.'],
  ['Objectives of the project', 'UCMP aims to centralize campus buying and selling, reduce scattered WhatsApp or Telegram transactions, improve payment transparency, and increase user trust.'],
  ['Effectiveness and user satisfaction', 'The interface applies HCI principles such as visibility of system status, error prevention, recognition over recall, feedback, and mobile-friendly controls. Usability testing focuses on task success, completion time, error rate, and satisfaction score.'],
]))

content.push(p('1.0 Introduction', 'Heading1'))
content.push(
  p(
    'Buying and selling activities in a campus environment often happen through informal channels such as messaging groups, face-to-face arrangements, and scattered social media posts. These channels make it difficult for students to search products, compare sellers, confirm payment, track orders, and identify reliable sellers.',
  ),
)
content.push(
  p(
    'UCMP is a web-based campus marketplace designed for the UPNM community. It provides a structured platform where buyers can browse products, chat with sellers, pay manually using QR codes, upload receipts, and track orders. Sellers can manage listings, respond to buyers, verify receipts, and update fulfilment status. Admins can monitor products, users, orders, and AI moderation decisions.',
  ),
)

content.push(p('1.1 Project Objectives', 'Heading2'))
content.push(bullet('Provide a centralized marketplace for UPNM buyers and sellers.'))
content.push(bullet('Reduce confusion in manual payment by guiding buyers through QR payment and receipt upload.'))
content.push(bullet('Improve communication through real-time buyer-seller chat and online status feedback.'))
content.push(bullet('Increase marketplace trust using seller ratings, reviews, and completed order indicators.'))
content.push(bullet('Improve campus safety by using AI moderation to detect prohibited products before publication.'))

content.push(p('2.0 User Requirements and HCI Refinement', 'Heading1'))
content.push(p('2.1 Buyer Requirements', 'Heading2'))
content.push(bullet('Register and browse products without a long verification delay.'))
content.push(bullet('Search products, view details, compare seller trust indicators, and chat with sellers.'))
content.push(bullet('Receive clear QR payment instructions and upload a receipt screenshot confidently.'))
content.push(bullet('Track order status without needing to refresh or ask the seller repeatedly.'))
content.push(p('2.2 Seller Requirements', 'Heading2'))
content.push(bullet('Create and manage product listings with image, stock, price, variations, and add-ons.'))
content.push(bullet('Receive immediate AI feedback when a product is rejected by moderation.'))
content.push(bullet('Verify buyer receipts manually before preparing or sending orders.'))
content.push(bullet('Build reputation through ratings, reviews, profile details, and completed order count.'))
content.push(p('2.3 Admin Requirements', 'Heading2'))
content.push(bullet('Monitor users, products, orders, receipts, and marketplace activity.'))
content.push(bullet('Review every AI moderation decision and override it when necessary.'))
content.push(bullet('Maintain marketplace safety by tracking prohibited product attempts and seller warnings.'))

content.push(p('3.0 Refined System Functions', 'Heading1'))
content.push(table(['Function', 'HCI Purpose', 'Final Behaviour'], [
  ['Real-time chat', 'Supports immediate communication and visibility of system status.', 'Chat shows online, idle, offline, sent, delivered, and read indicators.'],
  ['Manual QR payment', 'Reduces payment friction and prevents user uncertainty.', 'Buyer scans seller QR, pays outside the system, uploads receipt, and waits for seller verification.'],
  ['Trust indicators', 'Compensates for the absence of official verified badges.', 'Seller profile displays rating, reviews, completed orders, business details, and pickup information.'],
  ['AI moderation', 'Prevents unsafe or prohibited products from reaching buyers.', 'AI checks image, title, and description, then approves or rejects the listing with a reason.'],
  ['Admin review', 'Keeps human responsibility in the loop.', 'Admin confirms or overrides AI decisions while preserving audit records.'],
]))

content.push(p('4.0 AI-Powered Product Moderation Design', 'Heading1'))
content.push(
  p(
    'AI moderation is introduced as the major safety and trust enhancement for the HCI final project. The system analyses the uploaded product image, title, category, and description before deciding whether the product should be approved or rejected.',
  ),
)
content.push(numbered('Seller submits product information and an image.'))
content.push(numbered('The AI moderation service evaluates whether the product is allowed in a UPNM campus marketplace.'))
content.push(numbered('If approved, the product is published and visible to buyers.'))
content.push(numbered('If rejected, the product is hidden from buyers, locked as an audit record, and the seller receives an immediate regulation warning.'))
content.push(numbered('Admin reviews the AI decision and either confirms it or overrides it.'))
content.push(numbered('Repeated prohibited product attempts trigger seller warnings and may suspend the seller account after three offences.'))

content.push(p('4.1 Prohibited Product Categories', 'Heading2'))
content.push(bullet('Vape, cigarettes, tobacco, and related accessories.'))
content.push(bullet('Alcohol and intoxicating substances.'))
content.push(bullet('Drugs, controlled substances, or drug-related paraphernalia.'))
content.push(bullet('Weapons, dangerous items, or offensive content.'))
content.push(bullet('Any product that violates campus safety or marketplace regulations.'))

content.push(p('5.0 HCI Design Principles Applied', 'Heading1'))
content.push(table(['HCI Principle', 'Application in UCMP'], [
  ['Visibility of system status', 'Network status, order status, AI decision labels, moderation reasons, and message ticks keep users informed.'],
  ['Error prevention', 'AI moderation blocks prohibited products before buyers can view them, and receipt preview reduces wrong-file uploads.'],
  ['Recognition over recall', 'Buttons, chips, labels, and clear order stages reduce the need for users to remember previous steps.'],
  ['User control and freedom', 'Users can edit allowed listings, cancel pending actions, search products, and navigate between dashboards.'],
  ['Consistency and standards', 'Buyer, seller, and admin pages use consistent cards, buttons, status colours, and feedback notifications.'],
  ['Feedback and recovery', 'Toast messages and dialogs explain successful actions, rejected products, warnings, and account suspension.'],
]))

content.push(p('6.0 Development Summary', 'Heading1'))
content.push(
  p(
    'The refined UCMP prototype is developed as a responsive web application using a modern JavaScript frontend with role-based pages for buyer, seller, and admin. Supabase is used for authentication, database synchronization, real-time chat, and AI moderation through an Edge Function connected to an AI model.',
  ),
)
content.push(table(['Layer', 'Technology or Method', 'Purpose'], [
  ['Frontend', 'Vue.js / Quasar UI', 'Build responsive buyer, seller, admin, chat, cart, and profile interfaces.'],
  ['Backend', 'Supabase', 'Store users, products, orders, chat messages, reviews, and moderation data.'],
  ['AI', 'OpenAI vision-capable moderation flow', 'Analyse product image and text for prohibited marketplace items.'],
  ['Security', 'Role-based access and RLS policies', 'Reduce unauthorized database access and protect user data.'],
  ['Payment', 'Manual QR and receipt upload', 'Avoid payment gateway complexity while preserving payment evidence.'],
]))

content.push(p('7.0 Testing and Evaluation Plan', 'Heading1'))
content.push(p('7.1 Functional Test Cases', 'Heading2'))
content.push(table(['Test Case', 'Expected Result'], [
  ['Buyer registers and browses products', 'Buyer can access product catalogue immediately after registration.'],
  ['Buyer checks out using QR payment', 'System shows seller QR and allows receipt upload with preview.'],
  ['Seller uploads legal product', 'AI approves product and buyers can view it.'],
  ['Seller uploads prohibited product', 'AI rejects product, hides it from buyers, displays warning, and locks audit record.'],
  ['Admin overrides AI rejection', 'Product status changes to approved and becomes visible to buyers.'],
  ['Seller reaches three prohibited attempts', 'Seller account becomes inactive and cannot post new products.'],
  ['Buyer and seller use chat', 'Messages sync with clear sent, delivered, read, and online/offline indicators.'],
]))
content.push(p('7.2 Usability Evaluation Metrics', 'Heading2'))
content.push(bullet('Task success rate: percentage of users who complete browsing, checkout, receipt upload, and seller verification tasks.'))
content.push(bullet('Task completion time: time taken to complete core buyer and seller flows.'))
content.push(bullet('Error rate: number of failed uploads, incorrect payment steps, or misunderstood admin decisions.'))
content.push(bullet('User satisfaction: post-test rating using a 1 to 5 Likert scale.'))
content.push(bullet('Trust perception: user confidence in seller reliability and marketplace safety after viewing ratings and AI moderation labels.'))

content.push(p('8.0 Effectiveness and User Satisfaction', 'Heading1'))
content.push(
  p(
    'The refined UCMP design improves effectiveness by reducing uncertainty in three high-risk moments: contacting sellers, making manual payments, and trusting marketplace listings. Real-time chat indicators help users understand whether communication is active. QR payment instructions and receipt preview support payment confidence. Seller reputation indicators reduce trust gaps caused by the absence of official verification badges.',
  ),
)
content.push(
  p(
    'AI moderation contributes to user satisfaction by increasing perceived safety. Buyers are less likely to encounter prohibited products, while sellers receive immediate feedback instead of waiting for manual review. Admins retain final responsibility because every AI decision remains available for confirmation or override.',
  ),
)
content.push(table(['Evaluation Area', 'Expected Improvement'], [
  ['Efficiency', 'Users complete checkout and receipt upload with fewer repeated questions.'],
  ['Learnability', 'Simple labels, visible steps, and familiar marketplace patterns reduce learning effort.'],
  ['Safety', 'Prohibited products are rejected before publication and recorded for admin audit.'],
  ['Trust', 'Ratings, reviews, completed orders, and moderation transparency increase buyer confidence.'],
  ['Satisfaction', 'Clear feedback reduces anxiety during payment, order tracking, and product moderation.'],
]))

content.push(p('9.0 Conclusion', 'Heading1'))
content.push(
  p(
    'UCMP has been refined from a general Software Engineering and Design marketplace project into an HCI-focused final project that emphasizes usability, trust, feedback, and safety. The final design addresses the assignment requirements by expanding the original proposal into a developed and testable system with clear user requirements, project objectives, interaction design decisions, and evaluation criteria.',
  ),
)
content.push(
  p(
    'The most important HCI contribution is the combination of transparent manual payment flow, real-time communication feedback, community trust indicators, and AI product moderation with admin review. Together, these improvements make the campus marketplace more usable, safer, and more suitable for the UPNM community.',
  ),
)

content.push(p('References', 'Heading1'))
content.push(bullet('Tutorial 2 Project Proposal: UPNM Market Place (UCMP), TSI3723 Human-Computer Interaction.'))
content.push(bullet('Course lecture materials on usability, universal usability, design principles, evaluation, direct manipulation, information search, data visualization, and timely user experience.'))
content.push(bullet('Nielsen Norman Group usability heuristics and standard HCI evaluation practices.'))

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${content.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:qFormat/><w:pPr><w:spacing w:before="0" w:after="180"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="1F4E79"/><w:sz w:val="44"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:qFormat/><w:pPr><w:spacing w:after="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:color w:val="5B6770"/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="160"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="1F4E79"/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:b/><w:color w:val="2F75B5"/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Numbered"><w:name w:val="Numbered"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:color="BFBFBF"/><w:left w:val="single" w:sz="4" w:color="BFBFBF"/><w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/><w:right w:val="single" w:sz="4" w:color="BFBFBF"/><w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideV w:val="single" w:sz="4" w:color="D9D9D9"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`

const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
  <w:abstractNum w:abstractNumId="2"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum>
  <w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>
</w:numbering>`

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`

const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`

const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>UCMP HCI Final Project Report</dc:title>
  <dc:subject>Human-Computer Interaction final project</dc:subject>
  <dc:creator>UCMP Group</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-08-31T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-31T00:00:00Z</dcterms:modified>
</cp:coreProperties>`

const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Codex</Application></Properties>`

const write = (rel, data) => fs.writeFileSync(path.join(workDir, rel), data)
write('[Content_Types].xml', contentTypes)
write('_rels/.rels', rootRels)
write('word/document.xml', documentXml)
write('word/styles.xml', stylesXml)
write('word/numbering.xml', numberingXml)
write('word/_rels/document.xml.rels', docRels)
write('docProps/core.xml', core)
write('docProps/app.xml', app)

const zipPath = path.join(outDir, 'UCMP_HCI_Final_Project_Report.zip')
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
