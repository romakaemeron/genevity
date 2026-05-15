import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_wU2TNRiIo3aX@ep-curly-hill-alvilgmb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require');

const slugToUuid = {
  'emface':                  '1c0e7c32-b5e3-4b13-a7b1-dfca00d32b2e',
  'ultraformer-mpt':         '64b53daf-9b6b-454f-ac77-d80dc834d0d0',
  'exion-face':              'ae2da282-bc80-45ca-8ba2-55f35d1d759f',
  'volnewmer':               'b36bf14f-ce58-40ca-8464-9725c46006dc',
  'botulinum-therapy':       'e594993b-ff7b-4ed2-ae31-b99d0fa79104',
  'contour-plasty':          '00faf2fb-967c-494b-9e27-1e3ef6350388',
  'biorevitalisation':       'edaee8b1-6fcc-4b85-8c51-359e937f4fd1',
  'mesotherapy':             '92ea9a76-8d92-4223-a06c-01734c6f2f4f',
  'prp-therapy':             'ca4fe5fa-bcb6-4a85-b87b-d44d6eb83758',
  'rejuran':                 '20bbb338-7d40-4a03-bc5e-6ffbbd026552',
  'exosomes':                '9ddd18de-6155-426b-bda9-a747982c31eb',
  'stem-cell-therapy':       'ac477047-38b0-43c5-9888-b7ff9667795d',
  'juvederm':                '09a79c64-f855-43a2-8421-8aced4b1b0b1',
  'polyphil':                '28352a85-44bc-4562-8887-c7e421f9ae69',
  'acupulse-co2':            'b477c8ba-8468-4da3-aaf8-fb4e6d334956',
  'hydrafacial':             '10cc1f01-7b3d-4786-8ef9-f9dada67650f',
  'm22-stellar-black':       '08bddab4-a956-4e9b-b34a-516155bb99d1',
  'splendor-x':              '34d0edf5-c80e-4f5c-b29a-0dae111059f5',
  'emsculpt-neo':            'd69c11e5-c8fd-4e7b-a3e4-7cade12a78e0',
  'exion-body':              '8dd6ca4c-1a52-4b5f-9ec2-abe8baad365e',
  'ultraformer-mpt-body':    'df495f3f-9a6d-43bc-98cd-6732ff2d2b7f',
  'bioimpedance':            '656fe906-225f-4da3-9790-2dd36461ed68',
  'iv-therapy':              '48c5ab2c-5d46-4b1e-a53d-4c2c73ced5e6',
  'longevity-program':       'f22c3b93-9550-45a3-9a8a-0539742a7e6d',
  'check-up-40':             'd158d5f3-a77a-4f52-a452-349957199282',
  'hormonal-balance':        'da29eec7-71d3-4532-9cac-23505d4de834',
  'nutraceuticals':          '4eec0ed4-30ef-4c87-bfa9-377b1f717a5d',
  'laser-women':             '66122d58-1190-4123-8b8d-c90a9b001218',
  'laser-men':               '80f94ced-f355-467d-81ea-e290682c6404',
  'acupulse-co2-intimate':   'b2704335-db4b-4930-8f9b-f875ff35653d',
  'monopolar-rf-lifting':    '00126ecb-a7af-459c-b05a-4f2bde6edec7',
  'cosmetologist':           'b82ecf35-17c1-41da-a109-de7f196a2bb2',
  'endocrinologist':         '43d461e6-bf19-40e5-9b01-d2a135064e2d',
  'ultrasound':              'f87dbc6f-8528-4c6b-89a1-0672bb11de03',
  'ultrasound-diagnostician':'6aef10c6-1ae3-4385-9776-c3fc5f081986',
};

const relationships = {
  'emface':                  ['ultraformer-mpt', 'botulinum-therapy', 'biorevitalisation', 'exion-face'],
  'ultraformer-mpt':         ['emface', 'botulinum-therapy', 'contour-plasty', 'biorevitalisation'],
  'exion-face':              ['emface', 'volnewmer', 'biorevitalisation', 'botulinum-therapy'],
  'volnewmer':               ['exion-face', 'biorevitalisation', 'botulinum-therapy', 'hydrafacial'],
  'botulinum-therapy':       ['contour-plasty', 'biorevitalisation', 'emface', 'hydrafacial'],
  'contour-plasty':          ['botulinum-therapy', 'juvederm', 'polyphil', 'biorevitalisation'],
  'biorevitalisation':       ['botulinum-therapy', 'mesotherapy', 'prp-therapy', 'hydrafacial'],
  'mesotherapy':             ['biorevitalisation', 'prp-therapy', 'exosomes', 'hydrafacial'],
  'prp-therapy':             ['mesotherapy', 'rejuran', 'exosomes', 'acupulse-co2'],
  'rejuran':                 ['prp-therapy', 'exosomes', 'acupulse-co2', 'biorevitalisation'],
  'exosomes':                ['prp-therapy', 'rejuran', 'stem-cell-therapy', 'acupulse-co2'],
  'stem-cell-therapy':       ['exosomes', 'prp-therapy', 'iv-therapy', 'longevity-program'],
  'juvederm':                ['botulinum-therapy', 'contour-plasty', 'polyphil', 'biorevitalisation'],
  'polyphil':                ['contour-plasty', 'juvederm', 'botulinum-therapy', 'biorevitalisation'],
  'acupulse-co2':            ['rejuran', 'exosomes', 'prp-therapy', 'hydrafacial'],
  'hydrafacial':             ['botulinum-therapy', 'biorevitalisation', 'mesotherapy', 'exion-face'],
  'm22-stellar-black':       ['hydrafacial', 'acupulse-co2', 'splendor-x', 'biorevitalisation'],
  'splendor-x':              ['m22-stellar-black', 'hydrafacial', 'laser-women', 'laser-men'],
  'laser-women':             ['splendor-x', 'm22-stellar-black', 'hydrafacial'],
  'laser-men':               ['splendor-x', 'hydrafacial', 'exion-body'],
  'emsculpt-neo':            ['exion-body', 'ultraformer-mpt-body', 'bioimpedance', 'iv-therapy'],
  'exion-body':              ['emsculpt-neo', 'ultraformer-mpt-body', 'bioimpedance', 'hormonal-balance'],
  'ultraformer-mpt-body':    ['emsculpt-neo', 'exion-body', 'bioimpedance'],
  'bioimpedance':            ['emsculpt-neo', 'exion-body', 'longevity-program', 'check-up-40'],
  'longevity-program':       ['check-up-40', 'hormonal-balance', 'iv-therapy', 'nutraceuticals'],
  'check-up-40':             ['longevity-program', 'hormonal-balance', 'bioimpedance', 'endocrinologist'],
  'hormonal-balance':        ['check-up-40', 'longevity-program', 'iv-therapy', 'endocrinologist'],
  'iv-therapy':              ['longevity-program', 'nutraceuticals', 'check-up-40', 'emsculpt-neo'],
  'nutraceuticals':          ['iv-therapy', 'longevity-program', 'hormonal-balance', 'bioimpedance'],
  'acupulse-co2-intimate':   ['monopolar-rf-lifting', 'hormonal-balance'],
  'monopolar-rf-lifting':    ['acupulse-co2-intimate', 'hormonal-balance'],
  'cosmetologist':           ['hydrafacial', 'biorevitalisation', 'botulinum-therapy', 'mesotherapy'],
  'endocrinologist':         ['hormonal-balance', 'check-up-40', 'ultrasound', 'bioimpedance'],
  'ultrasound':              ['check-up-40', 'endocrinologist', 'ultrasound-diagnostician', 'longevity-program'],
  'ultrasound-diagnostician':['ultrasound', 'check-up-40', 'endocrinologist'],
};

// Build rows
const rows = [];
for (const [serviceSlug, relatedSlugs] of Object.entries(relationships)) {
  const serviceId = slugToUuid[serviceSlug];
  if (!serviceId) { console.error(`Unknown slug: ${serviceSlug}`); process.exit(1); }
  for (let i = 0; i < relatedSlugs.length; i++) {
    const relatedId = slugToUuid[relatedSlugs[i]];
    if (!relatedId) { console.error(`Unknown related slug: ${relatedSlugs[i]}`); process.exit(1); }
    rows.push({ service_id: serviceId, related_service_id: relatedId, sort_order: i });
  }
}

console.log(`Prepared ${rows.length} rows to insert.`);

// Step 1: DELETE all existing rows
console.log('Deleting existing rows from service_related...');
const deleteResult = await sql`DELETE FROM service_related`;
console.log('Delete done.');

// Step 2: INSERT all rows in one statement using unnest / values
console.log('Inserting rows...');
for (const row of rows) {
  await sql`
    INSERT INTO service_related (service_id, related_service_id, sort_order)
    VALUES (${row.service_id}::uuid, ${row.related_service_id}::uuid, ${row.sort_order})
  `;
}

// Step 3: Verify count
const countResult = await sql`SELECT COUNT(*)::int AS cnt FROM service_related`;
const count = countResult[0].cnt;
console.log(`\nDone. Rows in service_related: ${count} (expected: ${rows.length})`);
if (count !== rows.length) {
  console.error('COUNT MISMATCH! Check for issues.');
  process.exit(1);
}
console.log('All good!');
