import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const serviceContent = JSON.parse(fs.readFileSync(path.join(root, 'seo-content.json'), 'utf8'));
const pages = fs.readdirSync(root, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .filter(entry => !entry.parentPath.includes('node_modules') && !entry.parentPath.includes('.git'))
  .map(entry => path.join(entry.parentPath, entry.name));

const footer = prefix => `<footer class="site-footer"><div class="container footer-grid"><div class="footer-intro"><a class="brand" href="${prefix}" aria-label="أمجد، الصفحة الرئيسية"><img class="amjad-wordmark" src="${prefix}images/amjad-wordmark.svg" alt="Amjad" width="260" height="88"></a><p>خدمات حدادة متنقلة لأعمال الحديد في مكة المكرمة، مع مراجعة كل طلب وفق أبعاده وموقعه.</p></div><nav class="footer-links" aria-label="روابط الموقع"><h2>دليل الموقع</h2><a href="${prefix}الخدمات/">الخدمات</a><a href="${prefix}اعمالنا/">معرض النماذج</a><a href="${prefix}من-نحن/">عن أمجد</a><a href="${prefix}مناطق-الخدمة/">نطاق الخدمة</a><a href="${prefix}الاسعار/">عوامل الأسعار</a><a href="${prefix}اتصل-بنا/">التواصل</a></nav><nav class="footer-links" aria-label="خدمات الحديد الرئيسية"><h2>أعمال الحديد</h2><a href="${prefix}ابواب-حديد/">أبواب حديد</a><a href="${prefix}شبابيك-حديد/">شبابيك حماية</a><a href="${prefix}درابزين-وسلالم/">سلالم ودرابزين</a><a href="${prefix}برجولات/">برجولات حديد</a><a href="${prefix}هناجر-معدنية/">هناجر معدنية</a><a href="${prefix}قرميد/">تركيب قرميد</a><a href="${prefix}ديكور-حديد/">ديكور حديد</a></nav><nav class="footer-links" aria-label="خدمات إضافية"><h2>خدمات أخرى</h2><a href="${prefix}مظلات-سيارات/">مظلات سيارات</a><a href="${prefix}حلوق-معدنية/">حلوق أبواب معدنية</a><a href="${prefix}قواعد-خزانات-ومكيفات/">قواعد خزانات ومكيفات</a><a href="${prefix}ابواب-وشبابيك-المنيوم/">أبواب وشبابيك ألمنيوم</a><a dir="ltr" href="tel:+966538341379">053 834 1379</a><a href="mailto:alahmramgad@gmail.com">البريد الإلكتروني</a></nav></div><div class="container footer-bottom"><p>© <span data-current-year>2026</span> أمجد لأعمال الحدادة – مكة المكرمة</p><a href="${prefix}اتصل-بنا/">اطلب الخدمة</a></div></footer>`;

const extras = {
  'الخدمات': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>اختر الخدمة بحسب الجزء المطلوب تنفيذه</h2><p>تجمع هذه الصفحة مسارات واضحة لكل نوع من أعمال الحديد بدل وضع كل الطلبات تحت وصف عام. افتح صفحة الخدمة المناسبة لتعرف المعلومات اللازمة قبل التواصل، والصور والمقاسات التي تساعد على فهم العمل، والعوامل التي تؤثر في التجهيز والتركيب.</p><p>إذا كان الطلب يجمع أكثر من خدمة، مثل باب مع حلق معدني أو برجولة مع تغطية، اذكر ذلك في رسالة واحدة. سنراجع ترابط العناصر وموقع كل قطعة قبل اقتراح الخطوة التالية، من دون افتراض أسعار أو مواصفات لا تناسب الموقع.</p></div></section>`,
  'اعمالنا': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>كيف تستخدم معرض النماذج؟</h2><p>الصور المعروضة مرجع بصري لفهم الأشكال والتكوينات، ولا ننسبها إلى عميل أو مشروع موثق. اختر الصورة الأقرب لفكرتك وحدد ما أعجبك فيها: توزيع الخطوط، درجة الخصوصية، اللون أو شكل الإطار، ثم أرسل صورة موقعك ومقاساته حتى تُناقش إمكانية تنفيذ اتجاه مناسب.</p><p>قد لا يلائم التصميم نفسه كل فتحة أو واجهة؛ لذلك تُراجع النسب ونقاط التثبيت ومساحة الحركة قبل اعتماد الشكل. توجد مهمة موثقة في TODO_FACTS لاستبدال النماذج تدريجيًا بصور أعمال حقيقية بعد موافقة صاحبها وتجهيز وصف دقيق لكل صورة.</p></div></section>`,
  'الاسعار': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>لماذا لا يوجد سعر موحّد للحدادة؟</h2><p>يتكون التقدير من أبعاد القطعة وعددها ونوع القطاعات وكثافة التفاصيل والتشطيب والإكسسوارات والنقل وطبيعة التركيب. الباب البسيط ليس مثل باب مزدوج مزخرف، والدرابزين المستقيم يختلف عن مسار متعدد الزوايا، كما تؤثر صعوبة الوصول وحالة الجدار أو الأرضية في الوقت المطلوب.</p><p>للحصول على تقدير أقرب، أرسل صورًا واضحة، والمقاسات التقريبية، والكمية، وموقع العمل داخل مكة، ووصف التشطيب المطلوب. لا ننشر أرقامًا غير مؤكدة؛ ويمكن إضافة نطاقات سعرية هنا بعد أن يزوّدنا صاحب النشاط بأسعار حقيقية محدثة ويؤكد ما تشمله.</p></div></section>`,
  'من-نحن': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>خدمة مباشرة تركز على متطلبات القطعة</h2><p>أمجد يقدم أعمال حدادة متنقلة في مكة للمنازل والمنشآت، ويبدأ كل طلب بتحديد نوع القطعة ومكان استخدامها وأبعادها المتاحة. الهدف هو تحويل الوصف أو الصورة المرجعية إلى متطلبات قابلة للمراجعة قبل التصنيع، ثم تنسيق التجهيز والتركيب بحسب الموقع.</p><p>لا يذكر الموقع سنوات خبرة أو أعداد عملاء أو شهادات غير موثقة. البيانات المنشورة تقتصر على الخدمات ووسائل التواصل ونطاق مكة، ويمكن إضافة معلومات أخرى عندما يقدمها صاحب النشاط ويؤكد صحتها.</p></div></section>`,
  'اتصل-بنا': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>اختصر وقت المراجعة برسالة مرتبة</h2><p>اكتب نوع الخدمة، وعدد القطع، والمقاسات التقريبية، والحي أو رابط الموقع داخل مكة، ثم أرفق صورًا كاملة وأخرى قريبة لنقاط التثبيت. إذا كانت لديك صورة مرجعية، وضّح العناصر التي تريدها بدل الاكتفاء بإرسالها من دون شرح.</p><p>يمكن التواصل بالهاتف أو واتساب أو البريد الظاهر في الصفحة. لا ترسل وثائق شخصية أو بيانات لا يحتاجها طلب الحدادة، ولا تعتمد موعدًا أو سعرًا قبل تأكيده مباشرة عبر وسيلة التواصل.</p></div></section>`,
  'مناطق-الخدمة': `<section class="section seo-rich-section" data-seo-rich><div class="container content-copy"><h2>تأكيد الوصول داخل مكة قبل الموعد</h2><p>نطاق الخدمة هو مكة المكرمة، لكن إمكانية الوصول والموعد يتأثران بموقع العمل وطبيعة الطلب وحجم القطع المطلوبة. أرسل رابط الموقع أو اسم الحي مع وصف مختصر للخدمة حتى يمكن تأكيد التغطية قبل ترتيب الزيارة.</p><p>لم ننشر قائمة أحياء على أنها مؤكدة لأن صاحب النشاط لم يعتمدها بعد. تظهر في TODO_FACTS أسماء أحياء مقترحة للمراجعة؛ وبعد التأكيد يمكن إضافة أقسام مفيدة داخل هذه الصفحة الواحدة من دون إنشاء صفحات أحياء مكررة.</p><a class="btn btn-secondary" href="https://www.google.com/maps/search/?api=1&amp;query=Makkah%2C%20Saudi%20Arabia" target="_blank" rel="noopener noreferrer">فتح خريطة مكة</a></div></section>`
};

function cleanLinks(html) {
  return html
    .replace(/href="\.\/index\.html([#?][^"]*)?"/g, (_, suffix = '') => `href="./${suffix}"`)
    .replace(/href="\.\.\/index\.html([#?][^"]*)?"/g, (_, suffix = '') => `href="../${suffix}"`)
    .replace(/href="(\.\.?\/[^"?#]+)\/index\.html([#?][^"]*)?"/g, (_, base, suffix = '') => `href="${base}/${suffix}"`);
}

for (const file of pages) {
  let html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const route = rel === 'index.html' || rel === '404.html' ? '' : path.dirname(rel);
  const prefix = route ? '../' : './';
  html = cleanLinks(html);
  if (html.includes('<figure class="service-hero-media"></figure>')) {
    html = html.replace('<div class="container service-hero-layout"><div>', '<div class="container"><div>').replace('<figure class="service-hero-media"></figure>', '');
  }
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, footer(prefix));

  if (serviceContent[route] && !html.includes('data-seo-rich')) {
    const data = serviceContent[route];
    const section = `<section class="section seo-rich-section" data-seo-rich><div class="container content-layout"><div class="content-copy"><p class="eyebrow"><span></span> دليل عملي</p><h2>${data.heading}</h2>${data.paragraphs.map(p => `<p>${p}</p>`).join('')}</div><aside class="feature-card"><h3>معلومات نحتاجها قبل الرد</h3><ul><li>صور واضحة للمكان من أكثر من زاوية</li><li>المقاسات التقريبية وعدد القطع</li><li>موقع العمل داخل مكة</li><li>الشكل أو الاستخدام المطلوب</li></ul><p>تُحدد التكلفة بعد مراجعة هذه البيانات؛ لا توجد أسعار رقمية منشورة قبل اعتمادها من صاحب النشاط.</p></aside></div></section>`;
    html = html.replace('<section class="section final-cta-section">', `${section}<section class="section final-cta-section">`);
  }
  if (serviceContent[route]) {
    html = html.replace('للحصول على تصور أولي، جهّز صورًا واضحة للمكان والمقاسات المتوفرة ووصفًا للاستخدام والشكل المرغوب. تُقدَّم الخدمة في موقع العمل داخل مكة حسب نطاق الخدمة وإمكانية الوصول.', `قبل طلب ${serviceContent[route].heading}، جهّز صور الموقع والمقاسات المتاحة وحدد الاستخدام والشكل المرغوب. تُراجع إمكانية تقديم هذه الخدمة في موقع العمل داخل مكة بعد معرفة الحي والتفاصيل.`);
  }
  if (extras[route] && !html.includes('data-seo-rich')) html = html.replace('</main>', `${extras[route]}</main>`);

  if (rel === 'index.html') {
    html = html
      .replace('أمجد حداد متنقل في مكة المكرمة لأعمال الأبواب والشبابيك والسلالم والدرابزين والبرجولات والهناجر والديكور الحديدي. نراجع تفاصيل طلبك ونصل إلى موقعك للتفصيل والتركيب.', 'أمجد حداد مكة يقدم أعمال الحديد للمنازل والمنشآت بخدمة متنقلة داخل مكة المكرمة. تشمل الطلبات الأبواب والشبابيك والسلالم والدرابزين والبرجولات والهناجر والقرميد والديكور المعدني، ويبدأ كل عمل بمراجعة الصور والمقاسات والاستخدام المطلوب قبل تحديد التجهيز والتركيب.')
      .replace('شاركنا نوع العمل وصور الموقع والمقاسات المتوفرة عبر واتساب، وسنتواصل معك لتحديد الخطوة المناسبة.', 'أرسل صور المكان والمقاسات التقريبية ونوع القطعة المطلوبة عبر واتساب لنراجع إمكانية التنفيذ وما يلزم قبل الموعد.')
      .replace('أرسل وصف العمل أو صوره عبر واتساب.', 'شارك صور الموقع ووصف الاستخدام والمقاسات المتاحة.')
      .replace('نحدد الحاجة للمعاينة ونراجع المقاسات والتصميم والخامة.', 'نراجع الصور أولًا ثم نؤكد الحاجة إلى زيارة الموقع وتثبيت الأبعاد.')
      .replace('يتم التنفيذ والتركيب وفق التفاصيل المتفق عليها.', 'تُجهز القطعة وتُنسق أعمال تثبيتها وفق ما تم اعتماده.')
      .replace('أرسل موقعك عبر واتساب لتنسيق المعاينة والوصول.', 'شارك رابط الموقع واسم الحي عبر واتساب لتأكيد التغطية والموعد.')
      .replace('<div class="map-card-content"><h3>حدادة متنقلة داخل مكة</h3><p>شارك رابط الموقع واسم الحي عبر واتساب لتأكيد التغطية والموعد.</p></div>', '<div class="map-card-content"><h3>حدادة متنقلة داخل مكة</h3><p>شارك رابط الموقع واسم الحي عبر واتساب لتأكيد التغطية والموعد.</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=Makkah%2C%20Saudi%20Arabia" target="_blank" rel="noopener noreferrer">فتح خريطة مكة ←</a></div>')
      .replace('هل تصل الخدمة إلى موقع العميل؟', 'ما المعلومات التي تساعد على مراجعة طلب الحدادة؟')
      .replace('نعم، أمجد حداد مكة يقدم خدمة حدادة متنقلة تصل إلى موقع العميل داخل نطاق الخدمة في مكة المكرمة.', 'أرسل صور المكان والمقاسات التقريبية ونوع القطعة واسم الحي داخل مكة؛ فهذه المعلومات توضح نطاق العمل وتساعد على تحديد الحاجة إلى زيارة الموقع.')
      .replace('كيف يتم تحديد تكلفة العمل؟', 'متى يصبح القياس النهائي ضروريًا؟')
      .replace('تتحدد التكلفة حسب المقاسات والخامة والتصميم والتشطيب وطبيعة موقع العمل، لذلك يلزم الاطلاع على تفاصيل الطلب أولًا.', 'يصبح القياس النهائي مهمًا قبل التصنيع عندما ترتبط القطعة بفتحة أو درج أو نقاط تثبيت قائمة؛ أما القياسات الأولية فتفيد في فهم الطلب فقط.')
      .replace('هل يمكن إرسال صور العمل عبر واتساب؟', 'هل يمكن البدء بصورة مرجعية للتصميم؟')
      .replace('نعم، أرسل صور الموقع والمقاسات المتوفرة عبر واتساب للمساعدة في فهم الطلب وتحديد الخطوة التالية.', 'نعم، أرسل الصورة مع توضيح الجزء المطلوب منها وصور موقعك الفعلي؛ فقد يلزم تعديل النسب أو التفاصيل لتناسب المساحة المتاحة.')
      ;
    if (!html.includes('class="section homepage-intro"')) html = html.replace(/<section class="section services-section"/, '<section class="section homepage-intro" data-seo-rich><div class="container content-layout"><div class="content-copy"><p class="eyebrow"><span></span> حداد في مكة المكرمة</p><h2>أعمال حديد تُراجع وفق الاستخدام والمقاس</h2><p>يخدم أمجد أصحاب المنازل والمنشآت الذين يحتاجون حدادًا متنقلًا في مكة لتفصيل قطعة جديدة أو تركيبها أو تقييم إمكانية إصلاح عمل قائم. بدلاً من اختيار حل موحّد، تُراجع فتحة الباب أو مسار الدرج أو مساحة البرجولة أو الموقف، لأن أبعاد الموقع وطريقة الاستخدام تحددان شكل العمل ونقاط تثبيته.</p><p>يساعد إرسال صور كاملة وصور قريبة مع قياسات أولية على فهم الطلب قبل الموعد. بعد ذلك تُناقش الخامة والتصميم والتشطيب والوصول إلى الموقع، وتُثبت المقاسات النهائية عند الحاجة. يعرض الموقع صفحات مستقلة لكل خدمة حتى يجد الزائر معلومات عملية عن التحضير والصيانة وعوامل السعر، من دون وعود ترتيب أو أسعار أو مواصفات لم يتم تأكيدها.</p></div><aside class="feature-card"><h3>قبل التواصل</h3><p>جهّز صور المكان، والمقاسات التقريبية، واسم الحي، وعدد القطع، وصورة مرجعية إن وجدت.</p><a class="btn btn-primary" href="./اتصل-بنا/">طرق التواصل</a></aside></div></section><section class="section services-section"');
    if (!html.includes('class="section reviews-placeholder"')) html = html.replace('</main>', `<section class="section reviews-placeholder" aria-labelledby="real-reviews-title"><div class="container content-copy"><p class="eyebrow"><span></span> تقييمات موثقة فقط</p><h2 id="real-reviews-title">مساحة مخصصة لآراء العملاء الحقيقية</h2><p>لن ننشر تقييمات أو نجومًا أو أسماء عملاء قبل توفر مراجعات حقيقية قابلة للتحقق وموافقة أصحابها. يمكنك الآن استخدام زر تقييم Google الموجود في الصفحة لمشاركة تجربتك الفعلية.</p></div></section></main>`);

    html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (_, json) => {
      const data = JSON.parse(json);
      for (const node of data['@graph'] || []) {
        const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        if (types.includes('HomeAndConstructionBusiness')) node['@type'] = ['LocalBusiness', 'HomeAndConstructionBusiness'];
        if (node['@type'] === 'FAQPage') {
          node.mainEntity = [
            { '@type': 'Question', name: 'ما المعلومات التي تساعد على مراجعة طلب الحدادة؟', acceptedAnswer: { '@type': 'Answer', text: 'أرسل صور المكان والمقاسات التقريبية ونوع القطعة واسم الحي داخل مكة؛ فهذه المعلومات توضح نطاق العمل وتساعد على تحديد الحاجة إلى زيارة الموقع.' } },
            { '@type': 'Question', name: 'متى يصبح القياس النهائي ضروريًا؟', acceptedAnswer: { '@type': 'Answer', text: 'يصبح القياس النهائي مهمًا قبل التصنيع عندما ترتبط القطعة بفتحة أو درج أو نقاط تثبيت قائمة؛ أما القياسات الأولية فتفيد في فهم الطلب فقط.' } },
            { '@type': 'Question', name: 'هل يمكن البدء بصورة مرجعية للتصميم؟', acceptedAnswer: { '@type': 'Answer', text: 'نعم، أرسل الصورة مع توضيح الجزء المطلوب منها وصور موقعك الفعلي؛ فقد يلزم تعديل النسب أو التفاصيل لتناسب المساحة المتاحة.' } }
          ];
        }
      }
      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    });
  }
  fs.writeFileSync(file, html);
}

console.log(`Applied SEO content and clean internal links to ${pages.length} HTML files.`);
