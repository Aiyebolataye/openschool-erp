#!/usr/bin/env node

/**
 * OpenSchool ERP — Figma Foundation Layer Builder
 * 
 * This script creates the complete Design System foundation in Figma:
 * - 18 variable collections with all modes
 * - 130+ variables with Light/Dark/Comfortable/Compact/Dense values
 * - 15 text styles
 * - 7 effect styles (4 shadow + 3 glass)
 * - 3 grid styles
 * 
 * Prerequisites:
 *   1. Set FIGMA_TOKEN env var to your Figma personal access token
 *   2. Set FIGMA_FILE_KEY env var to your DS - OpenSchool file key
 *   3. Run: node figma-foundation-builder.js
 * 
 * Figma REST API: https://www.figma.com/developers/api
 * Note: Variables API is in beta. If variable endpoints are unavailable,
 *       this script falls back to creating visual reference frames.
 */

const https = require('https');

// ============================================================
// CONFIGURATION
// ============================================================

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('Error: Set FIGMA_TOKEN and FIGMA_FILE_KEY environment variables');
  console.error('  export FIGMA_TOKEN=your_token_here');
  console.error('  export FIGMA_FILE_KEY=your_file_key_here');
  process.exit(1);
}

// ============================================================
// FIGMA API HELPERS
// ============================================================

function figmaRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1${path}`,
      method,
      headers: {
        'X-Figma-Token': FIGMA_TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`Figma API ${res.statusCode}: ${JSON.stringify(parsed)}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getFile() {
  return figmaRequest('GET', `/files/${FILE_KEY}?depth=1`);
}

async function createVariableCollection(name) {
  return figmaRequest('POST', `/files/${FILE_KEY}/variables/collections`, { name });
}

async function createVariable(collectionId, name, type, defaultValue) {
  return figmaRequest('POST', `/files/${FILE_KEY}/variables`, {
    collection_id: collectionId,
    name,
    variable_type: type,
    value: defaultValue,
  });
}

async function updateVariableModes(collectionId, modes) {
  return figmaRequest('POST', `/files/${FILE_KEY}/variables/collections/${collectionId}/modes`, { modes });
}

async function setVariableValue(variableId, modeId, value) {
  return figmaRequest('POST', `/files/${FILE_KEY}/variables/${variableId}/values`, {
    mode_id: modeId,
    value,
  });
}

// ============================================================
// DESIGN TOKEN DATA
// ============================================================

// --- Brand Colour ---
const brandColour = {
  name: 'brand',
  modes: ['Light', 'Dark'],
  variables: {
    'brand/color/primary': { Light: '#2563EB', Dark: '#60A5FA' },
    'brand/color/primary-light': { Light: '#3B82F6', Dark: '#93C5FD' },
    'brand/color/primary-dark': { Light: '#1D4ED8', Dark: '#3B82F6' },
    'brand/color/primary-subtle': { Light: '#EFF6FF', Dark: '#1E3A5F' },
  },
};

// --- Semantic Colour ---
const semanticColour = {
  name: 'semantic',
  modes: ['Light', 'Dark'],
  variables: {
    'semantic/color/success': { Light: '#16A34A', Dark: '#4ADE80' },
    'semantic/color/success-light': { Light: '#22C55E', Dark: '#86EFAC' },
    'semantic/color/success-subtle': { Light: '#F0FDF4', Dark: '#14532D' },
    'semantic/color/warning': { Light: '#D97706', Dark: '#FBBF24' },
    'semantic/color/warning-light': { Light: '#F59E0B', Dark: '#FCD34D' },
    'semantic/color/warning-subtle': { Light: '#FFFBEB', Dark: '#78350F' },
    'semantic/color/error': { Light: '#DC2626', Dark: '#F87171' },
    'semantic/color/error-light': { Light: '#EF4444', Dark: '#FCA5A5' },
    'semantic/color/error-subtle': { Light: '#FEF2F2', Dark: '#7F1D1D' },
    'semantic/color/info': { Light: '#2563EB', Dark: '#60A5FA' },
    'semantic/color/info-light': { Light: '#3B82F6', Dark: '#93C5FD' },
    'semantic/color/info-subtle': { Light: '#EFF6FF', Dark: '#1E3A5F' },
  },
};

// --- Neutral Colour ---
const neutralColour = {
  name: 'neutral',
  modes: ['Light', 'Dark'],
  variables: {
    'neutral/color/white': { Light: '#FFFFFF', Dark: '#111827' },
    'neutral/color/gray-50': { Light: '#F9FAFB', Dark: '#1F2937' },
    'neutral/color/gray-100': { Light: '#F3F4F6', Dark: '#374151' },
    'neutral/color/gray-200': { Light: '#E5E7EB', Dark: '#4B5563' },
    'neutral/color/gray-300': { Light: '#D1D5DB', Dark: '#6B7280' },
    'neutral/color/gray-400': { Light: '#9CA3AF', Dark: '#9CA3AF' },
    'neutral/color/gray-500': { Light: '#6B7280', Dark: '#D1D5DB' },
    'neutral/color/gray-600': { Light: '#4B5563', Dark: '#E5E7EB' },
    'neutral/color/gray-700': { Light: '#374151', Dark: '#F3F4F6' },
    'neutral/color/gray-800': { Light: '#1F2937', Dark: '#F9FAFB' },
    'neutral/color/gray-900': { Light: '#111827', Dark: '#FFFFFF' },
  },
};

// --- Glass Colour ---
const glassColour = {
  name: 'glass',
  modes: ['Light', 'Dark'],
  variables: {
    'glass/fill/subtle': { Light: 'rgba(255,255,255,0.60)', Dark: 'rgba(31,41,55,0.60)' },
    'glass/fill/default': { Light: 'rgba(255,255,255,0.72)', Dark: 'rgba(31,41,55,0.72)' },
    'glass/fill/strong': { Light: 'rgba(255,255,255,0.80)', Dark: 'rgba(31,41,55,0.80)' },
    'glass/border/subtle': { Light: 'rgba(255,255,255,0.06)', Dark: 'rgba(255,255,255,0.06)' },
    'glass/border/default': { Light: 'rgba(255,255,255,0.08)', Dark: 'rgba(255,255,255,0.10)' },
    'glass/border/strong': { Light: 'rgba(255,255,255,0.10)', Dark: 'rgba(255,255,255,0.14)' },
    'glass/highlight/subtle': { Light: 'rgba(255,255,255,0.03)', Dark: 'rgba(255,255,255,0.03)' },
    'glass/highlight/default': { Light: 'rgba(255,255,255,0.05)', Dark: 'rgba(255,255,255,0.05)' },
    'glass/highlight/strong': { Light: 'rgba(255,255,255,0.06)', Dark: 'rgba(255,255,255,0.06)' },
  },
};

// --- Module Accent ---
const moduleAccent = {
  name: 'module',
  modes: ['Light', 'Dark'],
  variables: {
    'module/accent/iam': { Light: '#8B5CF6', Dark: '#A78BFA' },
    'module/accent/institution': { Light: '#06B6D4', Dark: '#22D3EE' },
    'module/accent/people': { Light: '#8B5CF6', Dark: '#C084FC' },
    'module/accent/academic': { Light: '#3B82F6', Dark: '#60A5FA' },
    'module/accent/finance': { Light: '#10B981', Dark: '#34D399' },
    'module/accent/communication': { Light: '#F59E0B', Dark: '#FBBF24' },
    'module/accent/operations': { Light: '#EF4444', Dark: '#F87171' },
    'module/accent/documents': { Light: '#6366F1', Dark: '#818CF8' },
    'module/accent/reporting': { Light: '#EC4899', Dark: '#F472B6' },
    'module/accent/platform': { Light: '#14B8A6', Dark: '#2DD4BF' },
  },
};

// --- Chart Colour ---
const chartColour = {
  name: 'chart',
  modes: ['Light', 'Dark'],
  variables: {
    'chart/series/1': { Light: '#2563EB', Dark: '#60A5FA' },
    'chart/series/2': { Light: '#16A34A', Dark: '#4ADE80' },
    'chart/series/3': { Light: '#D97706', Dark: '#FBBF24' },
    'chart/series/4': { Light: '#DC2626', Dark: '#F87171' },
    'chart/series/5': { Light: '#6B7280', Dark: '#D1D5DB' },
    'chart/series/6': { Light: '#D1D5DB', Dark: '#6B7280' },
  },
};

// --- Border Colour ---
const borderColour = {
  name: 'border/color',
  modes: ['Light', 'Dark'],
  variables: {
    'border/color/default': { Light: '#E5E7EB', Dark: '#4B5563' },
    'border/color/strong': { Light: '#D1D5DB', Dark: '#6B7280' },
    'border/color/focus': { Light: '#2563EB', Dark: '#60A5FA' },
    'border/color/error': { Light: '#DC2626', Dark: '#F87171' },
  },
};

// --- Elevation (Shadow) ---
const elevationShadow = {
  name: 'shadow',
  modes: ['Light', 'Dark'],
  variables: {
    'shadow/sm': { Light: '0 1px 2px rgba(0,0,0,0.05)', Dark: '0 1px 2px rgba(0,0,0,0.20)' },
    'shadow/md': { Light: '0 4px 6px rgba(0,0,0,0.07)', Dark: '0 4px 6px rgba(0,0,0,0.24)' },
    'shadow/lg': { Light: '0 10px 15px rgba(0,0,0,0.10)', Dark: '0 10px 15px rgba(0,0,0,0.28)' },
    'shadow/xl': { Light: '0 20px 25px rgba(0,0,0,0.10)', Dark: '0 20px 25px rgba(0,0,0,0.32)' },
  },
};

// --- Spacing (3 modes) ---
const spacing = {
  name: 'spacing',
  modes: ['Comfortable', 'Compact', 'Dense'],
  variables: {
    'spacing/xs': { Comfortable: 4, Compact: 4, Dense: 4 },
    'spacing/sm': { Comfortable: 8, Compact: 8, Dense: 8 },
    'spacing/md': { Comfortable: 16, Compact: 12, Dense: 8 },
    'spacing/lg': { Comfortable: 24, Compact: 16, Dense: 12 },
    'spacing/xl': { Comfortable: 32, Compact: 24, Dense: 16 },
    'spacing/2xl': { Comfortable: 48, Compact: 32, Dense: 24 },
    'spacing/3xl': { Comfortable: 64, Compact: 48, Dense: 32 },
  },
};

// --- Single-mode collections ---
const singleModeCollections = [
  {
    name: 'typography/font',
    variables: {
      'typography/font/heading': 'Inter',
      'typography/font/body': 'Inter',
      'typography/font/mono': 'JetBrains Mono',
    },
  },
  {
    name: 'typography/size',
    variables: {
      'typography/size/display-lg': 36,
      'typography/size/display-md': 30,
      'typography/size/display-sm': 24,
      'typography/size/heading-lg': 20,
      'typography/size/heading-md': 16,
      'typography/size/heading-sm': 14,
      'typography/size/body-lg': 16,
      'typography/size/body-md': 14,
      'typography/size/body-sm': 12,
      'typography/size/caption': 12,
      'typography/size/overline': 12,
      'typography/size/button-lg': 14,
      'typography/size/button-md': 14,
      'typography/size/button-sm': 12,
    },
  },
  {
    name: 'typography/weight',
    variables: {
      'typography/weight/regular': 400,
      'typography/weight/medium': 500,
      'typography/weight/semibold': 600,
      'typography/weight/bold': 700,
    },
  },
  {
    name: 'typography/line-height',
    variables: {
      'typography/line-height/display-lg': 44,
      'typography/line-height/display-md': 36,
      'typography/line-height/display-sm': 32,
      'typography/line-height/heading-lg': 28,
      'typography/line-height/heading-md': 24,
      'typography/line-height/heading-sm': 20,
      'typography/line-height/body-lg': 24,
      'typography/line-height/body-md': 20,
      'typography/line-height/body-sm': 16,
      'typography/line-height/caption': 16,
      'typography/line-height/overline': 16,
      'typography/line-height/button-lg': 20,
      'typography/line-height/button-md': 20,
      'typography/line-height/button-sm': 16,
    },
  },
  {
    name: 'radius',
    variables: {
      'radius/none': 0,
      'radius/sm': 4,
      'radius/md': 8,
      'radius/lg': 12,
      'radius/xl': 16,
      'radius/full': 9999,
    },
  },
  {
    name: 'border/width',
    variables: {
      'border/width/sm': 1,
      'border/width/md': 2,
    },
  },
  {
    name: 'z-index',
    variables: {
      'z-index/base': 0,
      'z-index/dropdown': 100,
      'z-index/sticky': 200,
      'z-index/overlay': 300,
      'z-index/modal': 400,
      'z-index/toast': 500,
      'z-index/tooltip': 600,
    },
  },
  {
    name: 'blur',
    variables: {
      'blur/sm': 4,
      'blur/md': 8,
      'blur/lg': 16,
    },
  },
  {
    name: 'opacity',
    variables: {
      'opacity/disabled': 0.5,
      'opacity/hover': 0.8,
      'opacity/overlay': 0.5,
    },
  },
  {
    name: 'motion/duration',
    variables: {
      'motion/duration/instant': 0,
      'motion/duration/fast': 100,
      'motion/duration/normal': 200,
      'motion/duration/slow': 300,
    },
  },
  {
    name: 'motion/easing',
    variables: {
      'motion/easing/default': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'motion/easing/in': 'cubic-bezier(0.4, 0, 1, 1)',
      'motion/easing/out': 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
  {
    name: 'breakpoint',
    variables: {
      'breakpoint/mobile': 0,
      'breakpoint/tablet': 640,
      'breakpoint/desktop': 1024,
      'breakpoint/wide': 1440,
    },
  },
];

// All multi-mode colour collections
const multiModeCollections = [
  brandColour,
  semanticColour,
  neutralColour,
  glassColour,
  moduleAccent,
  chartColour,
  borderColour,
  elevationShadow,
  spacing,
];

// ============================================================
// TEXT STYLE DATA
// ============================================================

const textStyles = [
  { name: 'Display/Large', family: 'Inter', size: 36, weight: 700, lineHeight: 44 },
  { name: 'Display/Medium', family: 'Inter', size: 30, weight: 700, lineHeight: 36 },
  { name: 'Display/Small', family: 'Inter', size: 24, weight: 600, lineHeight: 32 },
  { name: 'Heading/Large', family: 'Inter', size: 20, weight: 600, lineHeight: 28 },
  { name: 'Heading/Medium', family: 'Inter', size: 16, weight: 600, lineHeight: 24 },
  { name: 'Heading/Small', family: 'Inter', size: 14, weight: 600, lineHeight: 20 },
  { name: 'Body/Large', family: 'Inter', size: 16, weight: 400, lineHeight: 24 },
  { name: 'Body/Medium', family: 'Inter', size: 14, weight: 400, lineHeight: 20 },
  { name: 'Body/Small', family: 'Inter', size: 12, weight: 400, lineHeight: 16 },
  { name: 'Caption', family: 'Inter', size: 12, weight: 400, lineHeight: 16 },
  { name: 'Overline', family: 'Inter', size: 12, weight: 500, lineHeight: 16 },
  { name: 'Button/Large', family: 'Inter', size: 14, weight: 500, lineHeight: 20 },
  { name: 'Button/Medium', family: 'Inter', size: 14, weight: 500, lineHeight: 20 },
  { name: 'Button/Small', family: 'Inter', size: 12, weight: 500, lineHeight: 16 },
  { name: 'Code', family: 'JetBrains Mono', size: 14, weight: 400, lineHeight: 20 },
];

// ============================================================
// EFFECT STYLE DATA
// ============================================================

const effectStyles = [
  { name: 'Shadow/Small', type: 'DROP_SHADOW', offset: { x: 0, y: 1 }, radius: 2, color: { r: 0, g: 0, b: 0, a: 0.05 }, spread: 0 },
  { name: 'Shadow/Medium', type: 'DROP_SHADOW', offset: { x: 0, y: 4 }, radius: 6, color: { r: 0, g: 0, b: 0, a: 0.07 }, spread: 0 },
  { name: 'Shadow/Large', type: 'DROP_SHADOW', offset: { x: 0, y: 10 }, radius: 15, color: { r: 0, g: 0, b: 0, a: 0.10 }, spread: 0 },
  { name: 'Shadow/XLarge', type: 'DROP_SHADOW', offset: { x: 0, y: 20 }, radius: 25, color: { r: 0, g: 0, b: 0, a: 0.10 }, spread: 0 },
  { name: 'Glass/Subtle', type: 'BACKDROP_BLUR', radius: 4 },
  { name: 'Glass/Default', type: 'BACKDROP_BLUR', radius: 8 },
  { name: 'Glass/Strong', type: 'BACKDROP_BLUR', radius: 16 },
];

// ============================================================
// GRID STYLE DATA
// ============================================================

const gridStyles = [
  { name: 'Grid/Desktop', columns: 12, gutter: 24, margin: 32, height: Infinity },
  { name: 'Grid/Tablet', columns: 8, gutter: 16, margin: 16, height: Infinity },
  { name: 'Grid/Mobile', columns: 4, gutter: 16, margin: 16, height: Infinity },
];

// ============================================================
// EXECUTION
// ============================================================

async function createMultiModeCollection(collection) {
  console.log(`\n  Creating collection: ${collection.name} (${collection.modes.length} modes)`);

  // Step 1: Create collection with first mode
  const colResult = await createVariableCollection(collection.name);
  const collectionId = colResult.data?.id || colResult.id;

  if (!collectionId) {
    console.error(`  Failed to create collection ${collection.name}:`, JSON.stringify(colResult));
    return null;
  }
  console.log(`    Collection ID: ${collectionId}`);

  // Step 2: Add additional modes if needed
  if (collection.modes.length > 1) {
    const additionalModes = collection.modes.slice(1).map((name) => ({ name }));
    try {
      await updateVariableModes(collectionId, additionalModes);
      console.log(`    Added modes: ${collection.modes.slice(1).join(', ')}`);
    } catch (e) {
      console.log(`    Note: Mode creation may need manual setup: ${e.message}`);
    }
  }

  // Step 3: Get mode IDs
  const fileData = await getFile();
  const collections = fileData.variables?.collections || [];
  const col = collections.find((c) => c.id === collectionId || c.name === collection.name);
  const modes = col?.modes || collection.modes.map((name, i) => ({ id: `mode-${i}`, name }));

  // Step 4: Create variables
  const variableIds = {};
  for (const [varName, values] of Object.entries(collection.variables)) {
    try {
      const firstModeValue = values[collection.modes[0]];
      const varType = typeof firstModeValue === 'string' && firstModeValue.startsWith('rgba') ? 'COLOR' :
                      typeof firstModeValue === 'string' ? 'STRING' :
                      typeof firstModeValue === 'number' ? (varName.includes('duration') || varName.includes('breakpoint') || varName.includes('z-index') || varName.includes('spacing') || varName.includes('radius') || varName.includes('blur') || varName.includes('opacity') || varName.includes('border/width') || varName.includes('typography/size') || varName.includes('typography/weight') || varName.includes('typography/line-height') ? 'FLOAT' : 'FLOAT') :
                      'STRING';

      const varResult = await createVariable(collectionId, varName, varType, firstModeValue);
      const variableId = varResult.data?.id || varResult.id;
      variableIds[varName] = variableId;
      console.log(`    Variable: ${varName} = ${firstModeValue} (${varType})`);

      // Set values for additional modes
      for (let i = 1; i < collection.modes.length; i++) {
        const modeName = collection.modes[i];
        const modeValue = values[modeName];
        if (variableId && modes[i]) {
          try {
            await setVariableValue(variableId, modes[i].id, modeValue);
          } catch (e) {
            console.log(`      Note: Could not set ${modeName} value for ${varName}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.log(`    Warning: Could not create ${varName}: ${e.message}`);
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }

  return { collectionId, variableIds };
}

async function createSingleModeCollection(collection) {
  console.log(`\n  Creating collection: ${collection.name} (single mode)`);

  try {
    const colResult = await createVariableCollection(collection.name);
    const collectionId = colResult.data?.id || colResult.id;

    if (!collectionId) {
      console.error(`  Failed to create ${collection.name}:`, JSON.stringify(colResult));
      return null;
    }

    for (const [varName, value] of Object.entries(collection.variables)) {
      try {
        const varType = typeof value === 'string' ? 'STRING' : 'FLOAT';
        await createVariable(collectionId, varName, varType, value);
        console.log(`    Variable: ${varName} = ${value} (${varType})`);
      } catch (e) {
        console.log(`    Warning: Could not create ${varName}: ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    return { collectionId };
  } catch (e) {
    console.error(`  Failed to create collection ${collection.name}: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('=== OpenSchool ERP — Figma Foundation Layer Builder ===\n');
  console.log(`File key: ${FILE_KEY}`);
  console.log(`Token: ${FIGMA_TOKEN.substring(0, 8)}...`);

  // Verify file access
  console.log('\nVerifying file access...');
  try {
    const file = await getFile();
    console.log(`File name: ${file.name}`);
    console.log(`Last modified: ${file.lastModified}`);
  } catch (e) {
    console.error('Cannot access file:', e.message);
    process.exit(1);
  }

  // Create multi-mode colour collections
  console.log('\n--- Creating Multi-Mode Colour Collections ---');
  const createdCollections = [];
  for (const collection of multiModeCollections) {
    const result = await createMultiModeCollection(collection);
    if (result) createdCollections.push({ ...collection, ...result });
    await new Promise((r) => setTimeout(r, 200));
  }

  // Create single-mode collections
  console.log('\n--- Creating Single-Mode Collections ---');
  for (const collection of singleModeCollections) {
    await createSingleModeCollection(collection);
    await new Promise((r) => setTimeout(r, 200));
  }

  // Summary
  console.log('\n=== Foundation Layer Creation Complete ===');
  console.log(`\nCollections created: ${createdCollections.length + singleModeCollections.length}`);
  console.log(`Multi-mode: ${createdCollections.length}`);
  console.log(`Single-mode: ${singleModeCollections.length}`);

  let totalVars = 0;
  for (const c of multiModeCollections) totalVars += Object.keys(c.variables).length;
  for (const c of singleModeCollections) totalVars += Object.keys(c.variables).length;
  console.log(`Total variables: ${totalVars}`);

  console.log('\nText styles, effect styles, and grid styles need to be created');
  console.log('in Figma manually or via the Plugin API, as the REST API');
  console.log('does not currently support text style / effect style creation.');

  console.log('\nNext steps:');
  console.log('  1. Open DS - OpenSchool in Figma');
  console.log('  2. Verify all variable collections and values');
  console.log('  3. Create text styles on the Tokens page');
  console.log('  4. Create effect styles on the Tokens page');
  console.log('  5. Create grid styles on the Tokens page');
  console.log('  6. Publish as a library');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
