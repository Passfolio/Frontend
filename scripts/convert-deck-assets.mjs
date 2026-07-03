/**
 * Deck 에셋 변환 파이프라인 (references/assets → src/assets/deck)
 *
 * 1) 비교 변형 생성:  node scripts/convert-deck-assets.mjs --variants <outDir>
 *    - PNG 5종을 q70/q80/q90 (+다이어그램류는 lossless) WebP로 변환해 <outDir>에 저장
 *    - 크기 표를 stdout에 출력하고 <outDir>/compare.html 비교 페이지 생성
 * 2) 확정 저장:       node scripts/convert-deck-assets.mjs --finalize <variantsDir> name=q80,name=q90,...
 *    - 선택된 변형을 src/assets/deck/<kebab-name>.webp 로 복사, 로고 SVG도 복사
 * 3) 썸네일 생성:     node scripts/convert-deck-assets.mjs --thumbnail <coverScreenshot.png>
 *    - 640×360 WebP(q80) → src/assets/deck/deck-thumbnail.webp
 */
import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import sharp from 'sharp';

const PROJECT_ROOT = resolve(new URL('..', import.meta.url).pathname);
const SRC_DIR = join(PROJECT_ROOT, 'references', 'assets');
const FINAL_DIR = join(PROJECT_ROOT, 'src', 'assets', 'deck');
const LOGO_SVG = 'passfolio_logo_cropped.svg';

/** 다이어그램/텍스트 계열은 lossy 아티팩트가 잘 보여 lossless 후보도 생성 */
const IMAGES = [
    { file: 'analysis-workflow-v3.png', out: 'analysis-workflow-v3', diagram: true },
    { file: 'architecture.png', out: 'architecture', diagram: true },
    { file: 'crumpled_wood.png', out: 'crumpled-wood', diagram: false },
    { file: 'portfolio-workflow-v2.png', out: 'portfolio-workflow-v2', diagram: true },
    { file: 'thinker.png', out: 'thinker', diagram: false },
];
const QUALITIES = [70, 80, 90];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

async function makeVariants(outDir) {
    mkdirSync(outDir, { recursive: true });
    const rows = [];
    for (const img of IMAGES) {
        const srcPath = join(SRC_DIR, img.file);
        const origSize = statSync(srcPath).size;
        const row = { name: img.out, orig: origSize, variants: {} };
        for (const q of QUALITIES) {
            const outPath = join(outDir, `${img.out}-q${q}.webp`);
            await sharp(srcPath).webp({ quality: q }).toFile(outPath);
            row.variants[`q${q}`] = statSync(outPath).size;
        }
        if (img.diagram) {
            const outPath = join(outDir, `${img.out}-lossless.webp`);
            await sharp(srcPath).webp({ lossless: true }).toFile(outPath);
            row.variants.lossless = statSync(outPath).size;
        }
        rows.push(row);
    }

    console.log('\n| image | original | q70 | q80 | q90 | lossless |');
    console.log('|---|---|---|---|---|---|');
    for (const r of rows) {
        const cells = ['q70', 'q80', 'q90', 'lossless']
            .map((k) => (r.variants[k] ? kb(r.variants[k]) : '-'))
            .join(' | ');
        console.log(`| ${r.name} | ${kb(r.orig)} | ${cells} |`);
    }

    const sections = rows
        .map((r) => {
            const img = IMAGES.find((i) => i.out === r.name);
            const variantTags = Object.entries(r.variants)
                .map(
                    ([k, size]) =>
                        `<figure><figcaption>${k} — ${kb(size)}</figcaption><img src="${r.name}-${k}.webp" loading="lazy"></figure>`,
                )
                .join('\n');
            return `<section><h2>${r.name} <small>(원본 ${kb(r.orig)})</small></h2>
<div class="grid">
<figure><figcaption>original — ${kb(r.orig)}</figcaption><img src="${encodeURI(join(SRC_DIR, img.file))}" loading="lazy"></figure>
${variantTags}
</div></section>`;
        })
        .join('\n');
    writeFileSync(
        join(outDir, 'compare.html'),
        `<!doctype html><meta charset="utf-8"><title>Deck asset WebP 비교</title>
<style>body{font-family:system-ui;background:#111;color:#eee;padding:24px}h2{margin:32px 0 12px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}figcaption{font-size:13px;color:#aaa;margin-bottom:4px}
img{width:100%;height:auto;background:#000}</style>
<h1>원본 PNG vs WebP 변형 (확대해서 텍스트/경계 확인)</h1>
${sections}`,
    );
    console.log(`\ncompare page: ${join(outDir, 'compare.html')}`);
}

async function finalize(variantsDir, choices) {
    mkdirSync(FINAL_DIR, { recursive: true });
    for (const [name, variant] of Object.entries(choices)) {
        const src = join(variantsDir, `${name}-${variant}.webp`);
        const dst = join(FINAL_DIR, `${name}.webp`);
        copyFileSync(src, dst);
        console.log(`${dst}  (${variant}, ${kb(statSync(dst).size)})`);
    }
    copyFileSync(join(SRC_DIR, LOGO_SVG), join(FINAL_DIR, 'passfolio-logo-cropped.svg'));
    console.log(`${join(FINAL_DIR, 'passfolio-logo-cropped.svg')}  (copied)`);
}

async function thumbnail(screenshotPath) {
    mkdirSync(FINAL_DIR, { recursive: true });
    const out = join(FINAL_DIR, 'deck-thumbnail.webp');
    await sharp(screenshotPath).resize(640, 360).webp({ quality: 80 }).toFile(out);
    console.log(`${out}  (${kb(statSync(out).size)})`);
}

const [mode, arg, ...rest] = process.argv.slice(2);
if (mode === '--variants' && arg) {
    await makeVariants(resolve(arg));
} else if (mode === '--finalize' && arg && rest[0]) {
    const choices = Object.fromEntries(rest[0].split(',').map((pair) => pair.split('=')));
    await finalize(resolve(arg), choices);
} else if (mode === '--thumbnail' && arg) {
    await thumbnail(resolve(arg));
} else {
    console.error('usage: --variants <outDir> | --finalize <variantsDir> name=q80,... | --thumbnail <png>');
    process.exit(1);
}
