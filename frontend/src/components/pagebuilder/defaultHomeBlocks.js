// The starter layout a new village site's homepage ships with — editable
// afterwards like any other page in the Page Builder.
let counter = 0;
const block = (type, props = {}) => ({ id: `home-${type}-${counter++}`, type, props });

export const DEFAULT_HOME_BLOCKS = [
    block('village-banner'),
    block('village-gallery'),
    block('panchayat-members', { headingEn: 'Panchayat Members', headingGu: 'પંચાયતના સભ્યો' }),
    block('village-map', { headingEn: 'Explore Our Village', headingGu: 'અમારું ગામ જુઓ' }),
    block('village-history'),
    block('village-achievements', { headingEn: 'Achievements', headingGu: 'ગામની સિદ્ધિઓ' }),
    block('special-personalities', { headingEn: 'Special Personalities', headingGu: 'વિશેષ વ્યક્તિઓ' }),
    block('contact-info'),
    block('census-table', { headingEn: 'Census Data', headingGu: 'વસ્તી ગણતરી ડેટા', year: '2021' }),
];
